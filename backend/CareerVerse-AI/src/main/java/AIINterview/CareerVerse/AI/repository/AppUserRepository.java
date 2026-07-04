package AIINterview.CareerVerse.AI.repository;

import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AppUser> findByRole(Role role);
}
