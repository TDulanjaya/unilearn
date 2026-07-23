package com.unilearn.server.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "lecturers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Lecturer {
    @Id
    private Long lecturerId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "lecturer_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(length = 100)
    private String designation;

    private Boolean isGuest = false;

    private LocalDate contractEndDate;
}
