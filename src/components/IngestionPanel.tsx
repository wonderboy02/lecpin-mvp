'use client';

import { useState } from 'react';

export function IngestionPanel() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ingestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setText(''); // 성공 시 텍스트 초기화
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">강의 텍스트 입력</h2>
      <p className="text-gray-600 mb-4">
        강의 텍스트를 입력하면 AI가 핵심 개념을 추출하여 그래프로 변환합니다.
      </p>

      <textarea
        className="w-full h-64 p-4 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="강의 텍스트를 입력하세요...

예시:
Linux Kernel은 운영체제의 핵심 구성요소입니다. Kernel은 프로세스 관리와 메모리 관리를 담당합니다. 프로세스는 실행 중인 프로그램의 인스턴스이며, 각 프로세스는 독립적인 메모리 공간을 가집니다..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? '처리 중... (1-2분 소요)' : '그래프 생성'}
      </button>

      {result && result.success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <div className="font-semibold text-green-800 mb-2">
            ✓ 그래프 생성 완료!
          </div>
          <p className="text-green-700">생성된 개념: {result.conceptCount}개</p>
          <p className="text-green-700">생성된 관계: {result.relationCount}개</p>
          <p className="text-sm text-green-600 mt-2">
            다음 단계: "2. 학습 진행" 탭에서 학습한 개념을 표시하세요.
          </p>
        </div>
      )}
    </div>
  );
}
