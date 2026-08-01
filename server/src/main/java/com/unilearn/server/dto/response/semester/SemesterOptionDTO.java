package com.unilearn.server.dto.response.semester;

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
public class SemesterOptionDTO {

    private Long semesterId;
    private String name;
}
