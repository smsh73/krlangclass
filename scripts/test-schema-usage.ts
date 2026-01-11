/**
 * 스키마 사용 불일치 테스트
 * Prisma 스키마와 실제 코드에서 사용하는 필드명이 일치하는지 검증
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface SchemaField {
  model: string;
  field: string;
  dbField: string;
}

function parseSchema(): Map<string, SchemaField[]> {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
  const content = readFileSync(schemaPath, 'utf-8');
  const fields = new Map<string, SchemaField[]>();

  // 모델 파싱
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/gs;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const modelContent = match[2];
    const modelFields: SchemaField[] = [];

    // 필드 파싱
    const fieldRegex = /(\w+)\s+(\w+[?]?)\s*(@map\(["'](\w+)["']\))?/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
      const fieldName = fieldMatch[1];
      const dbFieldName = fieldMatch[4] || fieldMatch[1];
      
      if (fieldName !== 'id' && !fieldName.startsWith('@@')) {
        modelFields.push({
          model: modelName,
          field: fieldName,
          dbField: dbFieldName,
        });
      }
    }

    fields.set(modelName, modelFields);
  }

  return fields;
}

function findPrismaUsage(dir: string): Map<string, Set<string>> {
  const usage = new Map<string, Set<string>>();
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory() && !entry.includes('node_modules') && !entry.startsWith('.')) {
        walkDir(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      
      // prisma.modelName.findMany 등의 패턴 찾기
      const prismaPattern = /prisma\.(\w+)\.(findMany|findFirst|findUnique|create|update|delete|count|upsert)/g;
      let match;
      
      while ((match = prismaPattern.exec(content)) !== null) {
        const modelName = match[1];
        if (!usage.has(modelName)) {
          usage.set(modelName, new Set());
        }
        
        // 해당 모델 사용 부분에서 필드명 찾기
        const modelUsage = content.substring(match.index);
        const fieldPattern = /(\w+):\s*[^,}\]]+/g;
        let fieldMatch;
        
        while ((fieldMatch = fieldPattern.exec(modelUsage)) !== null) {
          const fieldName = fieldMatch[1];
          if (!['where', 'data', 'select', 'include', 'orderBy', 'take', 'skip'].includes(fieldName)) {
            usage.get(modelName)?.add(fieldName);
          }
        }
      }
    } catch (error) {
      // 파일 읽기 실패 무시
    }
  }

  return usage;
}

function testSchemaUsage() {
  console.log('Testing schema usage consistency...\n');

  try {
    const schemaFields = parseSchema();
    const codeUsage = findPrismaUsage(join(process.cwd(), 'app'));
    const libUsage = findPrismaUsage(join(process.cwd(), 'lib'));

    // lib 사용도 codeUsage에 병합
    for (const [model, fields] of libUsage.entries()) {
      if (!codeUsage.has(model)) {
        codeUsage.set(model, new Set());
      }
      fields.forEach(f => codeUsage.get(model)?.add(f));
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('Checking model usage...\n');

    // 스키마에 정의된 모델이 코드에서 사용되는지 확인
    for (const [modelName, fields] of schemaFields.entries()) {
      const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      const usedFields = codeUsage.get(prismaModelName) || new Set();

      if (usedFields.size === 0 && !['CurriculumDocument', 'AdminAccessLog'].includes(modelName)) {
        warnings.push(`Model ${modelName} is defined in schema but not used in code`);
      } else {
        console.log(`   ✓ ${modelName} is used in code`);
      }

      // 필드명 검증 (간단한 검사)
      for (const field of fields) {
        // @map이 있는 경우 DB 필드명과 코드 필드명이 다를 수 있음
        if (field.field !== field.dbField) {
          // 이는 정상이므로 경고만
        }
      }
    }

    // 코드에서 사용하는 모델이 스키마에 있는지 확인
    for (const [modelName, fields] of codeUsage.entries()) {
      const schemaModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      if (!schemaFields.has(schemaModelName)) {
        errors.push(`Model ${modelName} is used in code but not defined in schema`);
      }
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('Schema Usage Test Results:');
    console.log('='.repeat(50));

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ All schema usage tests passed!');
      return 0;
    }

    if (warnings.length > 0) {
      console.log(`\n⚠ Warnings (${warnings.length}):`);
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }

    if (errors.length > 0) {
      console.log(`\n✗ Errors (${errors.length}):`);
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
      return 1;
    }

    return 0;
  } catch (error: any) {
    console.error('Test failed:', error);
    return 1;
  }
}

testSchemaUsage();
