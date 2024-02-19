package explaner

import (
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"log"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Choice struct {
	Index        int      `json:"index"`
	Message      Message  `json:"message"`
	Logprobs     []string `json:"logprobs"`
	FinishReason string   `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type JSONResponse struct {
	ID                string   `json:"id"`
	Object            string   `json:"object"`
	Created           int      `json:"created"`
	Model             string   `json:"model"`
	Choices           []Choice `json:"choices"`
	Usage             Usage    `json:"usage"`
	SystemFingerprint string   `json:"system_fingerprint"`
}

func GenerateExplanation(question, answer, currentExplanation string) (string, error) {
	// Preprocess the input
	inputText := fmt.Sprintf("Give more explanation about this question:Question: %s, and why the answer %s is true, where the current Explanation: %s", question, answer, currentExplanation)

	// Create a new Fiber client
	client := fiber.Client{}
	body := fmt.Sprintf(`{
			"model": "gpt-3.5-turbo-0125",
			"max_tokens": 150,
			"temperature": 0.7,
			"top_p": 1.0,
			"n": 1,
			"messages": [
				  {
					"role": "user",
					"content": "%s"
				  }
			]
		}`, inputText)
	log.Println(body)
	// Make a POST request to the ChatGPT API using Fiber's HTTP client
	agent := client.Post("https://api.openai.com/v1/chat/completions").
		Set("Content-Type", "application/json").
		Set("Authorization", "Bearer ").
		Body([]byte(body))

	_, resp, err := agent.Bytes()

	if err != nil {
		return "Failed to generate explanation", err[0]
	}
	log.Println(string(resp))
	var response JSONResponse
	if err := json.Unmarshal(resp, &response); err != nil {
		return "Failed to generate explanation", err
	}

	if len(response.Choices) > 0 && response.Choices[0].Index == 0 {
		return response.Choices[0].Message.Content, nil
	} else {
		err := fmt.Errorf("failed to generate explanation")
		return "Failed to generate explanation", err
	}
}
