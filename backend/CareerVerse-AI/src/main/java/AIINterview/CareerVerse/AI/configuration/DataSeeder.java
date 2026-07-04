package AIINterview.CareerVerse.AI.configuration;

import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.Role;
import AIINterview.CareerVerse.AI.model.StudentProfile;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!appUserRepository.existsByEmail("admin@careerverse.ai")) {
                AppUser admin = new AppUser();
                admin.setFullName("CareerVerse Admin");
                admin.setEmail("admin@careerverse.ai");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                appUserRepository.save(admin);
            }

            if (!appUserRepository.existsByEmail("student@careerverse.ai")) {
                AppUser student = new AppUser();
                student.setFullName("Demo Student");
                student.setEmail("student@careerverse.ai");
                student.setPassword(passwordEncoder.encode("student123"));
                student.setRole(Role.STUDENT);

                StudentProfile profile = new StudentProfile();
                profile.setUser(student);
                profile.setCollege("CareerVerse Institute");
                profile.setDegree("B.Tech Computer Science");
                profile.setGraduationYear("2026");
                profile.setCareerGoal("Prepare for software engineering interviews.");
                student.setStudentProfile(profile);

                appUserRepository.save(student);
            }
        };
    }
}
