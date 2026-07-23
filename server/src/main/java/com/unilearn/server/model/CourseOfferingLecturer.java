package com.unilearn.server.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "course_offering_lecturers")
@IdClass(CourseOfferingLecturer.CourseOfferingLecturerId.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CourseOfferingLecturer {
    @Id
    @ManyToOne
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Id
    @ManyToOne
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer lecturer;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class CourseOfferingLecturerId implements Serializable {
        private Long courseOffering;
        private Long lecturer;
    }
}
