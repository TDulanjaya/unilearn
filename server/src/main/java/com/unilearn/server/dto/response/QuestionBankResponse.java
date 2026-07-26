package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class QuestionBankResponse {
    private Long bankId;
    private Long examinerId;
    private String examinerName;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String title;
}
