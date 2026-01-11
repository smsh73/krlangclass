/**
 * UI 컴포넌트 테스트 스크립트
 * 컴포넌트 파일의 기본 구조와 import 검증
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const componentsDir = join(process.cwd(), 'components');
const appDir = join(process.cwd(), 'app');

interface ComponentInfo {
  path: string;
  hasExport: boolean;
  hasImports: boolean;
  errors: string[];
}

function findComponents(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = join(basePath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findComponents(fullPath, relativePath));
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(relativePath);
    }
  }

  return files;
}

function analyzeComponent(filePath: string): ComponentInfo {
  const fullPath = join(process.cwd(), filePath);
  const content = readFileSync(fullPath, 'utf-8');
  const errors: string[] = [];

  const hasExport = /export\s+(default\s+)?(function|const|class|interface|type)/.test(content);
  const hasImports = /^import\s+/.test(content);

  // TypeScript/React 기본 검증
  if (filePath.endsWith('.tsx')) {
    if (!content.includes('react') && !content.includes('React')) {
      errors.push('Missing React import');
    }
  }

  // 'use client' 지시어 확인 (필요한 경우)
  if (filePath.includes('components') && content.includes('useState') && !content.includes("'use client'")) {
    errors.push('Missing "use client" directive for client component');
  }

  // 빈 파일 체크
  if (content.trim().length === 0) {
    errors.push('File is empty');
  }

  return {
    path: filePath,
    hasExport,
    hasImports,
    errors,
  };
}

function testUIComponents() {
  console.log('Testing UI components...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 컴포넌트 파일 찾기
    const componentFiles = findComponents(componentsDir, 'components');
    const pageFiles = findComponents(join(appDir, '[locale]'), 'app/[locale]');

    console.log(`Found ${componentFiles.length} component files`);
    console.log(`Found ${pageFiles.length} page files\n`);

    // 컴포넌트 분석
    console.log('Analyzing components...');
    for (const file of componentFiles) {
      const info = analyzeComponent(file);
      if (info.errors.length > 0) {
        errors.push(`${file}: ${info.errors.join(', ')}`);
        console.log(`   ✗ ${file}`);
        info.errors.forEach(e => console.log(`      - ${e}`));
      } else {
        console.log(`   ✓ ${file}`);
      }
    }

    // 페이지 분석
    console.log('\nAnalyzing pages...');
    for (const file of pageFiles) {
      const info = analyzeComponent(file);
      if (info.errors.length > 0) {
        warnings.push(`${file}: ${info.errors.join(', ')}`);
        console.log(`   ⚠ ${file}`);
        info.errors.forEach(e => console.log(`      - ${e}`));
      } else {
        console.log(`   ✓ ${file}`);
      }
    }

    // UI 컴포넌트 존재 확인
    console.log('\nChecking UI component structure...');
    const uiComponents = ['Card', 'Button', 'Input'];
    for (const comp of uiComponents) {
      const file = join(componentsDir, 'ui', `${comp}.tsx`);
      try {
        const content = readFileSync(file, 'utf-8');
        if (content.includes(`export.*${comp}`) || content.includes(`function ${comp}`)) {
          console.log(`   ✓ ${comp} component exists`);
        } else {
          errors.push(`${comp} component missing export`);
        }
      } catch {
        errors.push(`${comp} component file not found`);
      }
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('UI Component Test Results:');
    console.log('='.repeat(50));

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ All UI component tests passed!');
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

testUIComponents();
