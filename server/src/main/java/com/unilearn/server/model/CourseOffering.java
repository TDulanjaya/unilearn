package com.unilearn.server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "course_offerings")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CourseOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long offeringId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer primaryLecturer;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Material> materials;

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<Assignment> assignments;

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Exam> exams;

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<AttendanceSession> attendanceSessions;

    @OneToMany(mappedBy = "courseOffering", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<PersonalResource> personalResources;
}
