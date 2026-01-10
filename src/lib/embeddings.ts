import OpenAI from 'openai';

// Lazy initialization: 함수 호출 시점에만 OpenAI 클라이언트 생성
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * 단일 텍스트의 임베딩을 생성합니다
 * @param text 임베딩할 텍스트
 * @returns 3072차원 임베딩 벡터
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('임베딩 생성 실패:', error);
    throw new Error('임베딩 생성 중 오류가 발생했습니다');
  }
}

/**
 * 여러 텍스트의 임베딩을 배치로 생성합니다
 * @param texts 임베딩할 텍스트 배열
 * @returns 3072차원 임베딩 벡터 배열
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    const client = getOpenAIClient();
    // OpenAI API는 배치 요청을 지원하지만, 너무 많은 경우 청크로 나눔
    const BATCH_SIZE = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await client.embeddings.create({
        model: 'text-embedding-3-large',
        input: batch,
        encoding_format: 'float',
      });

      embeddings.push(...response.data.map((d) => d.embedding));
    }

    return embeddings;
  } catch (error) {
    console.error('배치 임베딩 생성 실패:', error);
    throw new Error('배치 임베딩 생성 중 오류가 발생했습니다');
  }
}

/**
 * 개념의 이름과 설명을 결합하여 임베딩할 텍스트를 생성합니다
 * @param name 개념 이름
 * @param description 개념 설명
 * @returns 임베딩용 텍스트
 */
export function conceptToEmbeddingText(
  name: string,
  description: string
): string {
  return `${name}: ${description}`;
}
