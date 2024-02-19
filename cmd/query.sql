-- name: SelectAllQuestions :many
SELECT * FROM questions;

-- name: SelectTopicWithFirstQuestionId :many
SELECT DISTINCT topic, MIN(id) AS question_id FROM questions_copy2 GROUP BY topic