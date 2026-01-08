'use client';

import { useState } from 'react';
import { TabButton } from '@/components/TabButton';
import { IngestionPanel } from '@/components/IngestionPanel';
import { ConceptsPanel } from '@/components/ConceptsPanel';
import { WorkflowPanel } from '@/components/WorkflowPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'ingestion' | 'concepts' | 'workflow'
  >('ingestion');

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">K-Audit MVP</h1>
          <p className="text-gray-600">
            GraphRAG 기반 학습 분석 시스템 - Differential Solver
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 border-b">
          <TabButton
            active={activeTab === 'ingestion'}
            onClick={() => setActiveTab('ingestion')}
          >
            1. 강의 입력
          </TabButton>
          <TabButton
            active={activeTab === 'concepts'}
            onClick={() => setActiveTab('concepts')}
          >
            2. 학습 진행
          </TabButton>
          <TabButton
            active={activeTab === 'workflow'}
            onClick={() => setActiveTab('workflow')}
          >
            3. 워크플로우 실행
          </TabButton>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'ingestion' && <IngestionPanel />}
        {activeTab === 'concepts' && <ConceptsPanel />}
        {activeTab === 'workflow' && <WorkflowPanel />}
      </div>
    </main>
  );
}
