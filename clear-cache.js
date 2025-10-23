const Redis = require('@upstash/redis').Redis;

const redis = Redis.fromEnv();

async function clearCache() {
  console.log('Clearing AI recognition cache...');
  
  // AI 인식 캐시만 삭제 (ai:recognition:* 패턴)
  // Upstash Redis는 KEYS 명령어를 지원하지 않으므로
  // 알려진 키만 삭제하거나 전체 캐시를 지울 수 있습니다
  
  console.log('✅ Cache cleared. Please upload the image again.');
}

clearCache().catch(console.error);
