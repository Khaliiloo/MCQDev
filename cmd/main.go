package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/Khaliiloo/gomcq/db"
	"github.com/Khaliiloo/gomcq/explaner"
	"github.com/dgrijalva/jwt-go"
	"github.com/go-gomail/gomail"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// User model
type User struct {
	ID                int            `db:"id" json:"id"`
	Username          string         `db:"name" json:"username"`
	Email             string         `db:"email" json:"email"`
	Password          string         `db:"password" json:"-"`
	IsVerified        sql.NullBool   `db:"is_verified" json:"is_verified"`
	VerificationToken sql.NullTime   `db:"verification_token" json:"-"`
	EmailVerifiedAt   sql.NullTime   `db:"email_verified_at" json:"email_verified_at"`
	RememberToken     sql.NullString `db:"remember_token" json:"remember_token"`
	CreatedAt         sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt         sql.NullTime   `db:"updated_at" json:"updated_at"`
	DeletedAt         sql.NullTime   `db:"deleted_at" json:"deleted_at"`
	LoginToken        sql.NullString `db:"login_token" json:"login_token"`
	LoginTokenExpires sql.NullTime   `db:"login_token_expires" json:"login_token_expires"`
	LastLoginAt       time.Time      `db:"last_login_at" json:"last_login_at"`
}

type Result struct {
	LanguageID                    int     `db:"language_id" json:"language_id"`
	LanguageName                  string  `db:"language_name" json:"language_name"`
	Topic                         string  `json:"topic"`
	UserAnswersCount              int     `db:"user_answers_count" json:"user_answers_count"`
	TotalQuestionCount            int     `db:"total_question_count" json:"total_question_count"`
	UserAnswersPercentage         float64 `db:"user_answers_percentage" json:"user_answers_percentage"`
	CorrectAnswersCount           int     `db:"correct_answers_count" json:"correct_answers_count"`
	CorrectAnswersPercentage      float64 `db:"correct_answers_percentage" json:"correct_answers_percentage"`
	QuestionsCount                int     `db:"questions_count" json:"questions_count"`
	TotalCorrectAnswersPercentage float64 `db:"total_correct_answers_percentage" json:"total_correct_answers_percentage"`
}

// Secret key for signing and validating JWT tokens
var jwtKey = []byte("your-secret-key")
var db2 *sqlx.DB
var users []User

type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	var err error
	db2, err = sqlx.Open("mysql", "root:password@tcp(localhost:3306)/gomcq?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}
	defer db2.Close()
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Define your MySQL database connection string
	conn, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/gomcq")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer conn.Close()

	// API endpoint to fetch languages
	app.Get("/api/languages", func(c *fiber.Ctx) error {
		// Fetch questions from the database
		sql := db.New(conn)
		languages, err := sql.SelectLanguages(context.Background())
		if err != nil {
			log.Printf("Error fetching languages from the database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch languages",
			})
		}

		return c.JSON(languages)
	})
	// API endpoint to fetch questions from the database
	app.Get("/api/questions", func(c *fiber.Ctx) error {
		// Fetch questions from the database
		sql := db.New(conn)
		questions, err := sql.SelectAllQuestions(context.Background())
		if err != nil {
			log.Printf("Error fetching questions from the database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch questions",
			})
		}

		return c.JSON(questions)
	})

	app.Get("/api/questions/:language_id/:login_token", func(c *fiber.Ctx) error {
		// Fetch questions from the database
		languageID := c.Params("language_id")
		loginToken := c.Params("login_token")
		var questionId int
		if languageID == "undefined" {
			var data = struct {
				LanguageID int `db:"language_id" json:"language_id"`
				QuestionID int `db:"question_id" json:"question_id"`
			}{}
			err = db2.Get(&data, `SELECT language_id, question_id FROM user_questions 
  			INNER JOIN users ON users.id = user_questions.user_id
  			WHERE login_token=? ORDER BY user_questions.id DESC LIMIT 1`, loginToken)

			languageID = strconv.Itoa(data.LanguageID)
			questionId = data.QuestionID
		}
		sql := db.New(conn)
		questions, err := sql.SelectQuestionsByLanguage(context.Background(), languageID)
		if err != nil || len(questions) == 0 {
			log.Printf("Error fetching questions from the database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch questions",
			})
		}
		var language db.Language

		if questions[0].ID != 1 {
			for index, _ := range questions {
				questions[index].ID = int32(index + 1)
			}
		}
		if questionId == 0 {
			err = db2.Get(&questionId, `SELECT MAX(question_id) FROM user_questions 
  			INNER JOIN users ON users.id = user_questions.user_id
  			WHERE login_token=? AND language_id=?`, loginToken, languageID)
		}

		var questionAnswer []struct {
			QuestionID int32  `db:"question_id" json:"question_id"`
			Answer     string `db:"answer" json:"answer"`
			UserChoice string `db:"choice" json:"user_choice"`
		}
		err = db2.Select(&questionAnswer, `SELECT question_id, answer, choice FROM user_questions 
  			INNER JOIN users ON users.id = user_questions.user_id
  			WHERE login_token=? AND language_id=?`, loginToken, languageID)
		if err != nil {
			log.Printf("Error fetching questions from the database: %v", err)
		}

		for _, userAnswer := range questionAnswer {
			for index, question := range questions {
				if userAnswer.QuestionID == question.ID {
					questions[index].UserAnswer = userAnswer.Answer
					questions[index].UserChoice = userAnswer.UserChoice
					break
				}

			}
		}

		err = db2.Get(&language, `SELECT * FROM languages WHERE id=?`, languageID)
		if err != nil {
			log.Printf("Error fetching language from the database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch language",
			})
		}

		return c.JSON(fiber.Map{"questions": questions, "questionId": questionId, "language": language})
	})

	app.Get("/api/topics/:language_id", func(c *fiber.Ctx) error {
		// Fetch questions from the database
		languageID := c.Params("language_id")
		sql := db.New(conn)
		topics, err := sql.SelectTopicWithFirstQuestionId(context.Background(), languageID)
		if err != nil {
			log.Printf("Error fetching questions from the database: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch questions",
			})
		}
		if topics[0].QuestionID != 1 {
			realID := topics[0].QuestionID - 1
			for i, value := range topics {
				topics[i].QuestionID = value.QuestionID - realID
			}
		}
		return c.JSON(topics)
	})

	app.Get("/api/userQuestions/:token/:language_id/:question_id/:answer/:choice", func(c *fiber.Ctx) error {
		// Fetch questions from the database
		languageID := c.Params("language_id")
		questionID := c.Params("question_id")
		choice := c.Params("choice")
		answer := 0
		if c.Params("answer") == "true" {
			answer = 1
		}
		token := c.Params("token")
		user := User{}
		err = db2.Get(&user, "SELECT * FROM users WHERE login_token =?", token)
		if err != nil {
			log.Println(err)
		}
		_, err = db2.Exec("INSERT INTO user_questions (user_id, question_id, language_id, answer, choice) VALUES (?,?,?,?,?)", user.ID, questionID, languageID, answer, choice)
		if err != nil {
			log.Println(err)
		}
		return c.JSON(fiber.Map{
			"message": "Answered successfully",
			"user":    user,
		})
	})

	app.Get("/api/results/:token", resultsHandler)

	//Not used, may will be removed
	//app.Post("/format-code", formatCodeHandler)
	app.Post("/api/run", runCodeHandler)

	app.Post("/api/register", register)

	app.Post("/api/login", login)

	app.Get("/api/verify-email/:token", verifyEmail)

	app.Post("/api/generate-explanation", func(c *fiber.Ctx) error {
		type RequestBody struct {
			Question           string `json:"question"`
			Answer             string `json:"answer"`
			CurrentExplanation string `json:"current_explanation"`
		}
		var requestBody RequestBody
		if err := c.BodyParser(&requestBody); err != nil {
			return err
		}

		// Generate explanation
		explanation, err := explaner.GenerateExplanation(requestBody.Question, requestBody.Answer, requestBody.CurrentExplanation)
		if err != nil {
			log.Println(err)
			return c.SendString("Can't get more explanation for now!")
		}
		// Return the generated explanation as a response
		fmt.Println(explanation)
		return c.JSON(fiber.Map{"explanation": explanation})
	})

	port := ":5000"
	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(port))
}

func resultsHandler(c *fiber.Ctx) error {

	token := c.Params("token")

	resultsQuery := `SELECT
		uq.language_id,
		l.name as language_name,
		q.topic,
		COUNT(uq.id) AS user_answers_count,
		(SELECT COUNT(*) FROM questions_copy2 WHERE topic = q.topic) AS total_question_count,
		COUNT(uq.id) / (SELECT COUNT(*) FROM questions_copy2 WHERE topic = q.topic) * 100 AS user_answers_percentage,
		SUM(uq.answer) AS correct_answers_count,
		SUM(uq.answer) / (SELECT COUNT(*) FROM questions_copy2 WHERE topic = q.topic) * 100  AS correct_answers_percentage,
		(SELECT COUNT(*) FROM questions_copy2 WHERE language_id = q.language_id)  AS questions_count,
		(SELECT COUNT(*) FROM user_questions WHERE language_id = q.language_id AND answer = 1 and user_id = users.id) / (SELECT COUNT(*) FROM questions_copy2 WHERE language_id = q.language_id) * 100  AS total_correct_answers_percentage
	FROM
	user_questions uq
	LEFT JOIN questions_copy2 q ON q.id = (uq.question_id + (SELECT id FROM questions_copy2 WHERE language_id = uq.language_id LIMIT 1) - 1)
	JOIN languages l ON q.language_id = l.id AND l.id = uq.language_id
	JOIN users ON users.id = uq.user_id
	WHERE
	users.login_token = ?
	GROUP BY
	users.id, uq.language_id, l.name, q.topic;`

	var results []Result
	err := db2.Select(&results, resultsQuery, token)
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   err.Error(),
			"message": "Error fetching results",
			"results": results,
		})
	}
	return c.JSON(fiber.Map{
		"results": results,
	})

}

func register(c *fiber.Ctx) error {
	var newUser User

	if err := c.BodyParser(&newUser); err != nil {
		return err
	}
	// Check if the email is already registered
	var existingUser User
	err := db2.Get(&existingUser, "SELECT * FROM users WHERE email=?", newUser.Email)
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Email is already registered",
		})
	} else if !errors.Is(err, sql.ErrNoRows) {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Database error",
		})
	}

	// Generate a unique verification token
	verificationToken := generateVerificationToken()

	// Insert the new user into the database with the verification token
	insertQuery := "INSERT INTO users (name, email, password, verification_token, created_at) VALUES (?, ?, ?, ?, ?)"
	_, err = db2.Exec(insertQuery, newUser.Username, newUser.Email, newUser.Password, verificationToken, time.Now().Format("2006-01-02 15:04:05"))
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to register user",
		})
	}

	// Send a verification email
	err = sendVerificationEmail(newUser.Email, verificationToken)
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to send verification email" + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Registration successful. Please check your email for verification instructions.",
	})
}

func runGoCode(outputFile string) (string, string, bool, error) {

	cmd := exec.Command("go", "build", "-o", "output", outputFile)
	err := cmd.Run()

	if err != nil {
		return "", "", false, err
	}

	// Run code
	cmd = exec.Command("./output")
	var output bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &output
	cmd.Stderr = &stderr
	//err = cmd.Run()
	done := make(chan error, 1)
	timeExceeded := false
	timeout := 10 * time.Second

	go func(cmd *exec.Cmd) {
		err := cmd.Run()
		done <- err
	}(cmd)

	// Wait for the command to finish or timeout
	select {
	case err := <-done:
		if err != nil {
			return output.String(), stderr.String(), timeExceeded, err
		}
	case <-time.After(timeout):
		timeExceeded = true
	}
	return output.String(), stderr.String(), timeExceeded, nil
}
func runCodeHandler(c *fiber.Ctx) error {
	body := c.Body()
	var data map[string]any
	json.Unmarshal(body, &data)
	code := data["code"].(string)
	languageId := data["language_id"].(float64)
	language := ""
	if languageId == 1 {
		language = "go"
	} else if languageId == 2 {
		language = "python"
	}

	if language == "go" {
		var formattedCode, err = formatGoCode(code)

		if len(strings.Trim(formattedCode, "")) == 0 {
			formattedCode = code
		}

		outputFile, err := writeGoCodeToFile(formattedCode)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Error writing code to file, " + err.Error(),
			})
		}
		output, errors, timeExceeded, err := runGoCode(outputFile)
		errorOutput := strings.Split(errors, "\n")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"formattedCode": formattedCode,
				"output":        []string{},
				"errors":        errorOutput,
			})
		}

		outputArray := strings.Split(output, "\n")

		if len(outputArray) > 5000 {
			outputArray = outputArray[:5000]
			errorOutput = append([]string{"Output of program is long. It only shows the first 5000 lines"},
				errorOutput...)
		}

		if timeExceeded {
			errorOutput = append([]string{"Program execution time exceeded the limit, stopped after 10 seconds."},
				errorOutput...)
		}
		log.Println(outputArray)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"formattedCode": formattedCode,
			"output":        outputArray,
			"errors":        errorOutput,
		})
	} else if language == "python" {
		output, error, timeExceeded, err := runPythonCode(code) // formatPythonCode(code)

		if err != nil && error == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Error in the code, " + err.Error(),
				"output":  output,
			})
		}

		result := strings.Split(output, "\n")
		var errorOutput = []string{}
		if error != "" {
			errorOutput = strings.Split(error, "\n")
			for i, line := range errorOutput {
				if strings.Contains(line, "File \"") {
					fileLineParts := strings.Split(line, ",")
					fileLineParts[0] = "File: \"code.py\" "
					errorOutput[i] = strings.Join(fileLineParts, ",")
				}
			}
		}

		if len(result) > 5000 {
			result = result[:5000]
			errorOutput = append([]string{"Output of program is long. It only shows the first 5000 lines"},
				errorOutput...)

		}
		if timeExceeded {
			errorOutput = append([]string{"Program execution time exceeded the limit, stopped after 10 seconds."},
				errorOutput...)
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"output": result,
			//"formattedCode": formattedCode,
			"errors": errorOutput,
		})
	}
	return c.Status(fiber.StatusOK).SendString("")
}
func writeGoCodeToFile(code string) (string, error) {
	// Create a temporary file to write the code

	file, err := os.Create("temp/" + strconv.Itoa(rand.Intn(10000000)) + "_code.go")
	if err != nil {
		return "", err
	}

	defer file.Close()
	_, err = file.Write([]byte(code))
	if err != nil {
		return "", err
	}
	return file.Name(), nil
}

func formatGoCode(code string) (string, error) {
	code, err := importPackages(code)
	return code, err

	cmd := exec.Command("gofmt")
	cmd.Stdin = strings.NewReader(code)

	var formattedCode bytes.Buffer
	cmd.Stdout = &formattedCode

	err = cmd.Run()
	if err != nil {
		return "", err
	}

	return formattedCode.String(), nil
}

func writePythonCodeToFile(code string) (string, error) {
	filePath := "temp/" + strconv.Itoa(rand.Intn(10000000)) + "_code.py"
	file, err := os.Create(filePath)
	fmt.Println(err)
	if err != nil {
		return "", err
	}
	defer file.Close()

	_, err = file.Write([]byte(code))
	if err != nil {
		return "", err
	}

	return filePath, nil
}
func formatPythonCode(code string) (string, error) {

	pythonPath := "python3"

	scriptPath := "./temp/code.py"

	// Create the command with exec.Command.
	cmd := exec.Command(pythonPath, "-m black", scriptPath)

	// Optional: Capture the output (stdout, stderr)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	// Execute the command
	err := cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())

	}

	// Print the output from the script
	fmt.Println("Output:", out.String())
	return out.String(), nil
}
func runPythonCode(code string) (string, string, bool, error) {

	scriptPath, _ := writePythonCodeToFile(code)
	pythonPath := "python3"

	cmd := exec.Command(pythonPath, scriptPath)

	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	done := make(chan error, 1)
	timeExceeded := false
	timeout := 10 * time.Second

	go func(cmd *exec.Cmd) {
		err := cmd.Run()
		done <- err
	}(cmd)

	// Wait for the command to finish or timeout
	select {
	case err := <-done:
		if err != nil {
			return out.String(), stderr.String(), timeExceeded, err
		}
	case <-time.After(timeout):
		timeExceeded = true
	}

	err := os.Remove(scriptPath)
	if err != nil {
		log.Println("Couldn't remove file: ", scriptPath)
	}

	return out.String(), "", timeExceeded, nil
}

// Not used
func formatCodeHandler(c *fiber.Ctx) error {
	// Read the Go code from the request's body
	code := c.Body()

	// Run the "gofmt" command as a subprocess
	codeWithImport, err := importPackages(string(code))
	if err != nil {
		codeWithImport = `package main
	import "fmt"
` + string(code)
		fmt.Println(codeWithImport)
	}
	cmd := exec.Command("gofmt")
	cmd.Stdin = bytes.NewReader([]byte(codeWithImport))

	// Capture the output of "gofmt," which will be the formatted Go code
	var formattedCode bytes.Buffer
	cmd.Stdout = &formattedCode

	err = cmd.Run()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to format the code")
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"formattedCode": formattedCode.String(),
	})
}

func importPackages(code string) (string, error) {
	cmd := exec.Command("goimports")
	cmd.Stdin = strings.NewReader(code)
	cmd.Stderr = os.Stderr
	var formattedCode bytes.Buffer
	cmd.Stdout = &formattedCode
	err := cmd.Run()
	if err != nil {
		fmt.Println("Error running goimports:", err)
		return "", err
	}

	if err != nil {
		fmt.Println("Error reading modified code:", err)
		return "", err
	}
	if err != nil {
		fmt.Println("Error deleting temporary file:", err)
		return "", err
	}

	return formattedCode.String(), nil
}

// createJWTToken creates a JWT token for the provided username
func createJWTToken(username string) (string, error) {
	// Create the claims
	claims := Claims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
			IssuedAt:  time.Now().Unix(),
		},
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func login(c *fiber.Ctx) error {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&loginData); err != nil {
		return err
	}

	// Find the user by email
	var user User
	err := db2.Get(&user, "SELECT * FROM users WHERE email=?", loginData.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Invalid email or password",
			})
		}
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Database error",
		})
	}

	if user.Password != loginData.Password {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid email or password",
		})
	}

	// Create a JWT token
	token, err := createJWTToken(user.Username)
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create JWT token",
		})
	}

	_, err = db2.Exec("UPDATE users SET last_login_at=NOW(), login_token=? WHERE id=?", token, user.ID)
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update user login status",
			"user":    user,
			"err":     err,
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
		"user":    user.Username,
	})
}

func verifyEmail(c *fiber.Ctx) error {
	token := c.Params("token")
	// Find the user with the provided token
	var user User
	err := db2.Get(&user, "SELECT * FROM users WHERE verification_token=?", token)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "Verification token not found",
			})
		}
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Database error",
		})
	}

	// Mark the user as verified in the database
	_, err = db2.Exec("UPDATE users SET is_verified=1 WHERE id=?", user.ID)
	if err != nil {
		log.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update user verification status",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email verification successful. You can now log in.",
	})
}

// generateVerificationToken generates a random verification token
func generateVerificationToken() string {
	rand.Seed(time.Now().UnixNano())
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	token := make([]byte, 32)
	for i := 0; i < 32; i++ {
		token[i] = chars[rand.Intn(len(chars))]
	}
	return string(token)
}

// sendVerificationEmail sends a verification email to the user
func sendVerificationEmail(email, token string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "qo@mcq.dev")
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Email Verification")
	m.SetBody("text/plain", fmt.Sprintf("Click the following link to verify your email: http://localhost:3000/verify-email/%s", token))

	d := gomail.NewDialer("mail.mawjood.ly", 465, "go@mawjood.ly", "cT+A1kp=ucO9")
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	auth := d.Auth
	fmt.Println(auth)
	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil
}
