import OpenAI from 'openai';

// Vite 환경 변수에서 OpenAI API 키를 가져옵니다. 
// (.env 파일에 VITE_OPENAI_API_KEY=sk-... 형태로 넣어두시면 됩니다)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // 백엔드 없이 프론트에서 직접 호출할 때 필수 옵션
}) : null;

// 회장님이 주신 "부서별 맞춤형 페르소나" 프롬프트 시스템
// 모든 응답이 한국어로 나오도록 강력한 지시 추가
const DEPT_SYSTEM_PROMPTS = {
  strategy: 
    "당신은 AGMC의 '전략기획 AI'입니다. 게임의 핵심 컨셉, 장르, 타겟 유저, 메인 루프를 기획합니다. 수익 모델(BM)은 배제하고 순수하게 '재미'와 '게임성'에 집중하세요. 전문적이고 전략적인 답변을 한국어로 제공하세요.",
  content: 
    "당신은 AGMC의 '콘텐츠개발 AI'입니다. 게임의 세계관, 시나리오, 캐릭터 설정을 담당합니다. 특히 게임의 비주얼 스타일을 구체적으로 묘사하고, 기술구현부가 코드로 구현할 수 있도록 상세한 에셋 설명(색상, 형태, 애니메이션 느낌 등)을 포함하세요. 풍부한 창의성을 발휘하여 한국어로 답변하세요.",
  engineering: 
    "당신은 AGMC의 '기술구현 AI'입니다. 전략과 콘텐츠 요약본을 바탕으로 게임 로직만 작성합니다. 반드시 `class MainScene extends Phaser.Scene` 형태의 Javascript 클래스 코드만 ````javascript ... ```` 블록 안에 작성하세요. HTML 뼈대나 Phaser Config 등 베이스 프레임워크는 이미 시스템에 내장되어 있으므로 절대 작성하지 마세요. 주석은 한국어로 작성하세요.",
  ops: 
    "당신은 AGMC의 '라이브운영 AI'입니다. 프로토타입의 난이도 밸런스, 레벨 디자인, 유저 피드백 시뮬레이션을 담당합니다. 수익 모델 관련 운영은 배제하고, 유저가 더 오래 즐겁게 플레이할 수 있는 개선안을 한국어로 제안하세요.",
  analytics: 
    "당신은 AGMC의 '데이터인사이트 AI'입니다. 게임의 재미 요소 분석, 난이도 곡선 시각화, 플레이 테스트 보고서를 담당합니다. 지표를 통해 게임의 완성도를 높이는 통찰을 한국어로 제공하세요."
};

/**
 * 회장님의 업무 지시를 각 AI 부서원에게 전달하는 핵심 함수
 * @param {string} deptId - 부서 ID (strategy, content, engineering 등)
 * @param {string} instruction - 회장님의 자연어 명령
 * @param {object} fullState - 현재 프로젝트의 전체 상태 (projectName, projectData)
 */
export const requestAiTask = async (deptId, instruction, fullState = {}) => {
  if (!openai) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.");
  }

  const { projectName, projectData } = fullState;
  const systemPromptBase = DEPT_SYSTEM_PROMPTS[deptId];
  
  if (!systemPromptBase) {
    throw new Error("존재하지 않는 부서입니다.");
  }

  // 콘텍스트 최적화 (토큰 절약): 각 부서의 데이터를 1~2줄(약 100자)로 강제 요약하여 전달
  const getSummary = (text) => text ? text.substring(0, 100).replace(/\n/g, ' ') + '...' : 'Not defined yet';

  const projectContext = `
    [CURRENT PROJECT: ${projectName || 'Unnamed Project'}]
    - Strategy: ${getSummary(projectData?.strategy)}
    - Content: ${getSummary(projectData?.content)}
    - Engineering: ${getSummary(projectData?.engineering)}
    - Ops: ${getSummary(projectData?.ops)}
    - Analytics: ${getSummary(projectData?.analytics)}
  `;

  const finalSystemPrompt = `
    ${systemPromptBase}
    
    You are working on a SHARED project within AGMC. 
    Here is the highly summarized 1-line context of what other departments have done:
    ${projectContext}

    IMPORTANT: Your response MUST be consistent with the work of other departments. 
    Focus ONLY on your specific role. Do not repeat the context.
    
    CRITICAL INSTRUCTION: ALL OUTPUT MUST BE IN KOREAN (한국어). Do not use English unless it is for code snippets or specific technical terminology.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: instruction }
      ],
      temperature: 0.7,
      max_tokens: 1500 // 불필요한 보일러플레이트가 제거되었으므로 토큰을 낮춰 안정성/속도 확보
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("GPT-4o 통신 오류:", error);
    throw error;
  }
};

/**
 * 프론트엔드 캔버스를 이용해 생성된 이미지의 흰색 배경을 투명하게(누끼 따기) 처리하는 헬퍼 함수
 * @param {string} base64Image - Base64 인코딩된 이미지 문자열
 * @returns {Promise<string>} 투명 처리가 완료된 Data URL 문자열
 */
const removeWhiteBackground = (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 완전한 흰색이 아니더라도 안티앨리어싱된 부분까지 제거하기 위한 허용 오차 (Tolerance)
      const tolerance = 240; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // R, G, B가 모두 허용 오차 이상이면 (즉, 거의 흰색이면)
        if (r >= tolerance && g >= tolerance && b >= tolerance) {
          data[i + 3] = 0; // Alpha 채널을 0(투명)으로 설정
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64Image}`;
  });
};

/**
 * DALL-E 3를 사용하여 게임 에셋 이미지를 생성하는 함수
 * @param {string} prompt - 이미지 생성을 위한 상세 묘사
 * @returns {Promise<string>} 생성된 이미지의 URL
 */
export const requestImageGeneration = async (prompt) => {
  if (!openai) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  // 사용자가 지정한 고정 베이스 프롬프트 (클래식 MMORPG 도트 치비 스타일)
  const basePrompt = `사용자가 요청한 정보를 클래식 온라인 게임 캐릭터 및 사물로 재해석하세요. 도트 그래픽 기반의 치비(Chibi) 아바타 스타일이며, 옛날 한국 MMORPG 캐릭터 선택창에 나올 법한 느낌입니다.
요청된 대상의 특징(헤어스타일, 머리색, 의상, 액세서리, 표정, 분위기, 질감 등)을 유지하되, 이를 단순화된 도트 디자인으로 표현하세요.
전체 크기는 작은 스프라이트 느낌. 동그란 얼굴, 큰 머리, 짧은 팔다리. 단순한 눈과 작은 입으로 귀엽게 표현하세요.
선명한 픽셀 윤곽선, 깨끗한 색 분리, 부드러운 파스텔 명암처리가 특징입니다. 게임 아이콘이나 아바타 스티커처럼 완성하세요.
배경은 완벽한 흰색(Pure white background)이어야 쉽게 누끼를 딸 수 있습니다. 전신(Full body), 정면(Front view) 구도.
실제 특징을 그대로 유지하되, 복잡한 디테일은 클래식 게임 아바타 수준으로 단순화하세요.

[사용자 요청 사항]: ${prompt}

[금지 사항 (DO NOT INCLUDE)]: 실사, 애니메이션 일러스트, 3D 렌더링, 과도한 디테일, 흐릿한 픽셀, 복잡한 배경, 추가 팔다리, 왜곡된 비율, 텍스트, 워터마크. 반드시 지키세요.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: basePrompt.substring(0, 4000), // DALL-E 3 prompt limit is 4000 chars
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    });

    const b64Json = response.data[0].b64_json;
    const transparentImageUrl = await removeWhiteBackground(b64Json);
    return transparentImageUrl;
  } catch (error) {
    console.error("DALL-E 3 이미지 생성 오류:", error);
    throw error;
  }
};
