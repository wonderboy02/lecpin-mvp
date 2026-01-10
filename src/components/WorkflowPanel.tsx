'use client';

import { useState } from 'react';

export function WorkflowPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runWorkflow = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/workflow/run', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.result);
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('워크플로우 실행 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Differential Solver 워크플로우
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">실행 단계:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>중심성 높은 개념 기반 문제 생성</li>
          <li>전체 그래프 참고 솔버 (Task A) - RAG 벡터 검색</li>
          <li>학습자 그래프 참고 솔버 (Task B) - RAG 벡터 검색</li>
          <li>점수 차이 분석 및 지식 격차 식별</li>
        </ol>
      </div>

      <button
        onClick={runWorkflow}
        disabled={loading}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        {loading
          ? '워크플로우 실행 중... (최대 5분 소요)'
          : '🚀 워크플로우 실행'}
      </button>

      {loading && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            ⏳ 워크플로우를 실행하고 있습니다. 잠시만 기다려주세요...
          </p>
        </div>
      )}

      {result && <ResultsDashboard result={result} />}
    </div>
  );
}

function ResultsDashboard({ result }: { result: any }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">📊 결과 분석</h3>

        {/* 점수 비교 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ScoreCard
            label="전체 DB 점수"
            score={result.baseScore}
            color="blue"
          />
          <ScoreCard
            label="학습자 점수"
            score={result.learnerScore}
            color="green"
          />
          <ScoreCard label="점수 차이" score={result.scoreGap} color="red" />
        </div>

        {/* 문제별 상세 */}
        <div>
          <h3 className="text-xl font-semibold mb-3">문제별 분석</h3>
          {result.results.evaluations.map((evaluation: any, idx: number) => (
            <div key={idx} className="mb-4 p-4 border rounded">
              <div className="font-semibold mb-2">
                문제 {evaluation.questionId}: {result.questions[idx]}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium mb-1">
                    전체 DB 답변 ({evaluation.baseScore}점)
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {result.baseAnswers[idx]}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {evaluation.baseReasoning}
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium mb-1">
                    학습자 답변 ({evaluation.learnerScore}점)
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {result.learnerAnswers[idx]}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {evaluation.learnerReasoning}
                  </div>
                </div>
              </div>

              {evaluation.knowledgeGap && evaluation.knowledgeGap.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <span className="font-medium">부족한 개념:</span>{' '}
                  {evaluation.knowledgeGap.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 요약 */}
        {result.results.summary && (
          <div className="mt-6 p-4 bg-gray-50 border rounded">
            <h4 className="font-semibold mb-2">📝 종합 분석</h4>
            <div className="space-y-1 text-sm">
              <p>
                전체 지식 기반 평균:{' '}
                {result.results.summary.baseScore.toFixed(1)}점
              </p>
              <p>
                학습자 평균: {result.results.summary.learnerScore.toFixed(1)}점
              </p>
              <p className="font-medium">
                점수 격차: {result.results.summary.scoreGap.toFixed(1)}점
              </p>
              {result.results.summary.knowledgeGaps.length > 0 && (
                <p className="text-yellow-700">
                  지식 격차 영역:{' '}
                  {result.results.summary.knowledgeGaps.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div
      className={`p-4 border rounded ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold">{score.toFixed(1)}</div>
    </div>
  );
}
