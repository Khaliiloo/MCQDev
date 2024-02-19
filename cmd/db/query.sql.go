// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.19.1
// source: query.sql

package db

import (
	"context"
	"fmt"
)

const selectAllQuestions = `-- name: SelectAllQuestions :many
SELECT id, language_id, topic, question, choice_a, choice_b, choice_c, choice_d, answer, explanation, code FROM questions_copy2
`

func (q *Queries) SelectAllQuestions(ctx context.Context) ([]Question, error) {
	rows, err := q.db.QueryContext(ctx, selectAllQuestions)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Question
	for rows.Next() {
		var i Question
		if err := rows.Scan(
			&i.ID,
			&i.LanguageID,
			&i.Topic,
			&i.Question,
			&i.ChoiceA,
			&i.ChoiceB,
			&i.ChoiceC,
			&i.ChoiceD,
			&i.Answer,
			&i.Explanation,
			&i.Code,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const SelectQuestionsByLanguage = `-- name: SelectAllQuestions :many
SELECT id, language_id, topic, question, choice_a, choice_b, choice_c, choice_d, answer, explanation, question_code, code, "" as user_answer, "" as user_choice FROM questions_copy2
WHERE language_id = `

func (q *Queries) SelectQuestionsByLanguage(ctx context.Context, languageID string) ([]Question, error) {
	rows, err := q.db.QueryContext(ctx, SelectQuestionsByLanguage + languageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Question
	for rows.Next() {
		var i Question
		if err := rows.Scan(
			&i.ID,
			&i.LanguageID,
			&i.Topic,
			&i.Question,
			&i.ChoiceA,
			&i.ChoiceB,
			&i.ChoiceC,
			&i.ChoiceD,
			&i.Answer,
			&i.Explanation,
			&i.QuestionCode,
			&i.Code,
			&i.UserAnswer,
			&i.UserChoice,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const selectTopicWithFirstQuestionId = `-- name: SelectTopicWithFirstQuestionId :many
SELECT DISTINCT topic, MIN(id) AS question_id, count(id) as number_of_questions FROM questions_copy2 WHERE language_id = %v GROUP BY topic
`

type SelectTopicWithFirstQuestionIdRow struct {
	Topic      string `json:"topic"`
	QuestionID int `json:"question_id"`
	NumberOfQuestions int `json:"number_of_questions"`
}

func (q *Queries) SelectTopicWithFirstQuestionId(ctx context.Context, languageID string) ([]SelectTopicWithFirstQuestionIdRow, error) {
	rows, err := q.db.QueryContext(ctx, fmt.Sprintf(selectTopicWithFirstQuestionId, languageID))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SelectTopicWithFirstQuestionIdRow
	for rows.Next() {
		var i SelectTopicWithFirstQuestionIdRow
		if err := rows.Scan(&i.Topic, &i.QuestionID, &i.NumberOfQuestions); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}


const selectLanguages = `-- name: SelectLanguages :many
SELECT id, name, logo, width, ace_mode FROM languages WHERE active = 1 ORDER BY id ASC
`
func (q *Queries) SelectLanguages(ctx context.Context) ([]Language, error) {
	rows, err := q.db.QueryContext(ctx, selectLanguages)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Language
	for rows.Next() {
		var i Language
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Logo,
			&i.Width,
			&i.AceMode,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}