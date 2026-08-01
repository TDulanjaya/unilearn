package com.unilearn.server.dto.response.lecturer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LecturerOptionDTO {

    private Long lecturerId;
    private String fullName;
}
