import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

/**
 * Neo4j 드라이버 인스턴스를 가져옵니다 (싱글톤)
 */
export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error(
        'Neo4j 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
      );
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return driver;
}

/**
 * Neo4j 세션을 생성합니다
 */
export function getSession(): Session {
  return getDriver().session();
}

/**
 * Neo4j 드라이버 연결을 종료합니다
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

/**
 * Neo4j 연결 상태를 확인합니다
 */
export async function verifyConnection(): Promise<boolean> {
  const session = getSession();
  try {
    const result = await session.run('RETURN 1 as num');
    const num = result.records[0].get('num');
    return num && num.toInt() === 1;
  } catch (error) {
    console.error('Neo4j 연결 실패:', error);
    return false;
  } finally {
    await session.close();
  }
}
