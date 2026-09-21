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
    private final S3StorageService s3StorageService;

    public StudentProfileService(
            AppUserRepository appUserRepository,
            StudentProfileRepository studentProfileRepository,
            S3StorageService s3StorageService
    ) {
        this.appUserRepository = appUserRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.s3StorageService = s3StorageService;
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

    @Transactional
    public String uploadProfilePicture(String email, org.springframework.web.multipart.MultipartFile file) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Student not found"));

        try {
            String s3Key = s3StorageService.uploadProfilePicture(file, user.getId());
            user.setProfilePictureS3Key(s3Key);
            appUserRepository.save(user);
            return s3StorageService.generatePresignedUrl(s3Key);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload profile picture", e);
        }
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
        String profilePictureUrl = null;
        if (user.getProfilePictureS3Key() != null) {
            profilePictureUrl = s3StorageService.generatePresignedUrl(user.getProfilePictureS3Key());
        }
        
        return new StudentProfileResponse(
                user.getFullName(),
                user.getEmail(),
                profile.getPhone(),
                profile.getCollege(),
                profile.getDegree(),
                profile.getGraduationYear(),
                profile.getPortfolioUrl(),
                profile.getLinkedinUrl(),
                profile.getCareerGoal(),
                profilePictureUrl
        );
    }
}
