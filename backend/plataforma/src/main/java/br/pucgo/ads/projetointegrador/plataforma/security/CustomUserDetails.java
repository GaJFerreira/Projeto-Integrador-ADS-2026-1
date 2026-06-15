package br.pucgo.ads.projetointegrador.plataforma.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import br.pucgo.ads.projetointegrador.plataforma.entity.User;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Constrói as authorities combinando:
     * 1. O Role do usuário (ex: ROLE_ADMIN) — mantém hasRole() e hasAnyAuthority('ROLE_ADMIN') funcionando
     * 2. As permissões associadas ao Role (ex: CREATE, READ, MANAGE_USERS) — ativa hasAuthority('CREATE')
     * 3. As permissões individuais do usuário — permissões extras além do Role
     */
    public static CustomUserDetails fromUser(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // 1. Role como authority (ex: ROLE_ADMIN, ROLE_CUIDADOR)
        authorities.add(new SimpleGrantedAuthority(user.getRole().getName()));

        // 2. Permissões herdadas do Role (ex: CREATE, READ, UPDATE, DELETE)
        if (user.getRole().getPermissions() != null) {
            user.getRole().getPermissions().forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission.getName()))
            );
        }

        // 3. Permissões individuais do usuário (atribuídas diretamente pelo admin)
        if (user.getPermissions() != null) {
            user.getPermissions().forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission.getName()))
            );
        }

        return new CustomUserDetails(user, authorities);
    }

    // Método para acessar o ID do usuário em @PreAuthorize
    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
