package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.AuthResponse;
import AIINterview.CareerVerse.AI.dto.LoginRequest;
import AIINterview.CareerVerse.AI.dto.StudentRegisterRequest;
import AIINterview.CareerVerse.AI.dto.StudentRegisterResponse;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.Role;
import AIINterview.CareerVerse.AI.model.StudentProfile;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String authority = "ROLE_" + user.getRole().name();
        String token = jwtService.generateToken(user.getEmail(), List.of(new SimpleGrantedAuthority(authority)));
        return new AuthResponse(token, user.getRole().name(), user.getFullName(), user.getEmail());
    }

    public StudentRegisterResponse registerStudent(StudentRegisterRequest request) {
        if (appUserRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        AppUser student = new AppUser();
        student.setFullName(request.fullName());
        student.setEmail(request.email());
        student.setPassword(passwordEncoder.encode(request.password()));
        student.setRole(Role.STUDENT);

        StudentProfile profile = new StudentProfile();
        profile.setUser(student);
        profile.setPhone(request.phone());
        profile.setCollege(request.college());
        profile.setDegree(request.degree());
        profile.setGraduationYear(request.graduationYear());
        student.setStudentProfile(profile);

        appUserRepository.save(student);
        return new StudentRegisterResponse("Registration successful. Please log in with your new account.", student.getEmail());
    }
}
