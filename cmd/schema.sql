CREATE TABLE `questions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `question` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `choice_a` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `choice_b` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `choice_c` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `choice_d` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `answer` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `explanation` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `question`(`question`(200) ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 420 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;