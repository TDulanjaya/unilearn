package com.unilearn.server.service.impl;

import com.unilearn.server.dto.request.FacultyRequest;
import com.unilearn.server.dto.response.FacultyResponse;
import com.unilearn.server.dto.response.PageResponseDTO;
import com.unilearn.server.exception.DuplicateEntryException;
import com.unilearn.server.exception.EntryNotFoundException;
import com.unilearn.server.exception.IllegalStateException;
import com.unilearn.server.model.Faculty;
import com.unilearn.server.model.User;
import com.unilearn.server.repository.DepartmentRepository;
import com.unilearn.server.repository.FacultyRepository;
import com.unilearn.server.repository.UserRepository;
import com.unilearn.server.util.mapper.FacultyMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacultyServiceImplTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private FacultyMapper facultyMapper = new FacultyMapper();

    @InjectMocks
    private FacultyServiceImpl facultyService;

    private FacultyRequest facultyRequest;
    private Faculty faculty;
    private User dean;

    @BeforeEach
    void setUp() {
        dean = new User();
        dean.setUserId(1L);
        dean.setFullName("Dr. John Smith");
        dean.setEmail("john.smith@unilearn.com");

        facultyRequest = FacultyRequest.builder()
                .name("Faculty of Engineering")
                .code("ENG")
                .deanUserId(1L)
                .build();

        faculty = Faculty.builder()
                .facultyId(10L)
                .name("Faculty of Engineering")
                .code("ENG")
                .dean(dean)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createFaculty - Success")
    void createFaculty_Success() {
        when(facultyRepository.existsByCode("ENG")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(dean));
        when(facultyRepository.save(any(Faculty.class))).thenReturn(faculty);

        FacultyResponse response = facultyService.createFaculty(facultyRequest);

        assertThat(response).isNotNull();
        assertThat(response.getFacultyId()).isEqualTo(10L);
        assertThat(response.getName()).isEqualTo("Faculty of Engineering");
        assertThat(response.getCode()).isEqualTo("ENG");
        assertThat(response.getHeadUserId()).isEqualTo(1L);
        assertThat(response.getHeadUserName()).isEqualTo("Dr. John Smith");

        verify(facultyRepository).save(any(Faculty.class));
    }

    @Test
    @DisplayName("createFaculty - Throws DuplicateEntryException when code already exists")
    void createFaculty_DuplicateCode_ThrowsException() {
        when(facultyRepository.existsByCode("ENG")).thenReturn(true);

        assertThatThrownBy(() -> facultyService.createFaculty(facultyRequest))
                .isInstanceOf(DuplicateEntryException.class)
                .hasMessageContaining("Faculty code already exists");

        verify(facultyRepository, never()).save(any());
    }

    @Test
    @DisplayName("createFaculty - Throws EntryNotFoundException when Dean user not found")
    void createFaculty_DeanNotFound_ThrowsException() {
        when(facultyRepository.existsByCode("ENG")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> facultyService.createFaculty(facultyRequest))
                .isInstanceOf(EntryNotFoundException.class)
                .hasMessageContaining("User not found with ID");
    }

    @Test
    @DisplayName("updateFaculty - Success")
    void updateFaculty_Success() {
        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));
        when(userRepository.findById(1L)).thenReturn(Optional.of(dean));
        when(facultyRepository.save(any(Faculty.class))).thenReturn(faculty);

        FacultyResponse response = facultyService.updateFaculty(10L, facultyRequest);

        assertThat(response).isNotNull();
        assertThat(response.getFacultyId()).isEqualTo(10L);
        verify(facultyRepository).save(faculty);
    }

    @Test
    @DisplayName("deleteFaculty - Success")
    void deleteFaculty_Success() {
        when(facultyRepository.existsById(10L)).thenReturn(true);
        when(departmentRepository.existsByFaculty_FacultyId(10L)).thenReturn(false);

        facultyService.deleteFaculty(10L);

        verify(facultyRepository).deleteById(10L);
    }

    @Test
    @DisplayName("deleteFaculty - Throws IllegalStateException when faculty has departments")
    void deleteFaculty_HasDepartments_ThrowsException() {
        when(facultyRepository.existsById(10L)).thenReturn(true);
        when(departmentRepository.existsByFaculty_FacultyId(10L)).thenReturn(true);

        assertThatThrownBy(() -> facultyService.deleteFaculty(10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete a faculty that still has departments");

        verify(facultyRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("getFacultyById - Success")
    void getFacultyById_Success() {
        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));

        FacultyResponse response = facultyService.getFacultyById(10L);

        assertThat(response).isNotNull();
        assertThat(response.getFacultyId()).isEqualTo(10L);
        assertThat(response.getCode()).isEqualTo("ENG");
    }

    @Test
    @DisplayName("getFacultyByCode - Success")
    void getFacultyByCode_Success() {
        when(facultyRepository.findByCode("ENG")).thenReturn(Optional.of(faculty));

        FacultyResponse response = facultyService.getFacultyByCode("ENG");

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("ENG");
    }

    @Test
    @DisplayName("getAllFaculties - Success")
    void getAllFaculties_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Faculty> facultyPage = new PageImpl<>(List.of(faculty), pageable, 1);
        when(facultyRepository.findAll(pageable)).thenReturn(facultyPage);

        PageResponseDTO<FacultyResponse> response = facultyService.getAllFaculties(pageable);

        assertThat(response).isNotNull();
        assertThat(response.getDataCount()).isEqualTo(1);
        assertThat(response.getDataList()).hasSize(1);
    }
}
