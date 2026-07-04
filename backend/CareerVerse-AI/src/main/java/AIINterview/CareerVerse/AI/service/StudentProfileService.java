package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.AdminStudentResponse;
import AIINterview.CareerVerse.AI.dto.StudentProfileRequest;
import AIINterview.CareerVerse.AI.dto.StudentProfileResponse;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.Role;
import AIINterview.CareerVerse.AI.model.StudentProfile;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.repository.StudentProfileRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentProfileService {

    private final AppUserRepository appUserRepository;
    private final StudentProfileRepository studentProfileRepository;

    public StudentProfileService(
            AppUserRepository appUserRepository,
            StudentProfileRepository studentProfileRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile(String email) {
        return toProfileResponse(findStudent(email));
    }

    @Transactional
    public StudentProfileResponse updateMyProfile(String email, StudentProfileRequest request) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Student not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("Only students can edit a student profile");
        }

        StudentProfile profile = user.getStudentProfile();
        if (profile == null) {
            profile = new StudentProfile();
            profile.setUser(user);
            user.setStudentProfile(profile);
        }

        user.setFullName(request.fullName());
        profile.setPhone(request.phone());
        profile.setCollege(request.college());
        profile.setDegree(request.degree());
        profile.setGraduationYear(request.graduationYear());
        profile.setPortfolioUrl(request.portfolioUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setCareerGoal(request.careerGoal());
        appUserRepository.save(user);

        return toProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<AdminStudentResponse> getStudents() {
        return appUserRepository.findByRole(Role.STUDENT).stream()
                .map(user -> {
                    StudentProfile profile = user.getStudentProfile();
                    return new AdminStudentResponse(
                            user.getId(),
                            user.getFullName(),
                            user.getEmail(),
                            profile == null ? "" : profile.getCollege(),
                            profile == null ? "" : profile.getDegree(),
                            profile == null ? "" : profile.getGraduationYear()
                    );
                })
                .toList();
    }

    private StudentProfile findStudent(String email) {
        return studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Student profile not found"));
    }

    private StudentProfileResponse toProfileResponse(StudentProfile profile) {
        AppUser user = profile.getUser();
        return new StudentProfileResponse(
                user.getFullName(),
                user.getEmail(),
                profile.getPhone(),
                profile.getCollege(),
                profile.getDegree(),
                profile.getGraduationYear(),
                profile.getPortfolioUrl(),
                profile.getLinkedinUrl(),
                profile.getCareerGoal()
        );
    }
}
