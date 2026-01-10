'use client';

import { useState, useEffect } from 'react';

interface Concept {
  name: string;
  description: string;
  is_learned: boolean;
  degree: number;
}

export function ConceptsPanel() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcepts();
  }, []);

  const fetchConcepts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/concepts');
      const data = await res.json();
      setConcepts(data.concepts);
    } catch (error) {
      console.error(error);
      alert('개념 목록 조회 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const toggleLearned = async (name: string, learned: boolean) => {
    try {
      await fetch(`/api/concepts/${encodeURIComponent(name)}/learn`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learned }),
      });
      fetchConcepts(); // 새로고침
    } catch (error) {
      console.error(error);
      alert('학습 상태 업데이트 중 오류가 발생했습니다');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">학습 진행 상황</h2>
        <p className="text-gray-600">
          생성된 개념이 없습니다. &quot;1. 강의 입력&quot; 탭에서 강의 텍스트를
          입력하세요.
        </p>
      </div>
    );
  }

  const learnedCount = concepts.filter((c) => c.is_learned).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-2">학습 진행 상황</h2>
      <p className="text-gray-600 mb-4">
        학습한 개념에 체크하세요. ({learnedCount}/{concepts.length}개 학습 완료)
      </p>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {concepts.map((concept) => (
          <div
            key={concept.name}
            className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={concept.is_learned}
              onChange={(e) => toggleLearned(concept.name, e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{concept.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {concept.description}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                연결도: {concept.degree} (다른 개념과의 관계 수)
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          💡 팁: 학습한 개념을 체크한 후 &quot;3. 워크플로우 실행&quot; 탭에서 분석을
          시작하세요.
        </p>
      </div>
    </div>
  );
}
