import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
}) : null;

export const getAIResponse = async (messages) => {
  if (!openai) {
    return "API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 입력해주세요.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `당신은 [Project: AI 게임 메이커 컴퍼니 (AGMC)]의 전략기획실 AI 팀장입니다. 

          회장님(사용자)의 지시는 무조건 '5분 안에 완성 가능한 초고속 웹 게임'으로 기획되어야 합니다. 사용자가 요청하지 않아도 이 원칙을 기본으로 합니다.

          답변 규칙 (반드시 준수):
          1. 서론 없이 즉시 [기획 보고서] 형식으로 본문을 시작하세요.
          2. 본문은 번호와 항목을 사용하여 핵심 게임 규칙, 상호작용, 커스텀 포인트를 정리하세요.
          3. 마크다운 강조 기호 '**'를 절대 사용하지 마세요.
          4. 보고서 작성이 끝나면 마지막에 한 줄 띄우고 반드시 "회장님, 그럼 다음 단계(콘텐츠 제작)로 진행할까요?" 라고 물으세요.
          5. 말투는 군더더기 없는 유능한 수석 직원의 비즈니스 문체를 사용하세요.`
        },
        ...messages
      ],
    });

    return response.choices[0].message.content.replace(/\*\*/g, '');
  } catch (error) {
    console.error("AI API Error:", error);
    return `오류가 발생했습니다: ${error.message}`;
  }
};

