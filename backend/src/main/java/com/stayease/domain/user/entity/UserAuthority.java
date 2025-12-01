package com.stayease.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "user_authority")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserAuthority.UserAuthorityId.class)
public class UserAuthority {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "authority_name", nullable = false)
    private Authority authority;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAuthorityId implements Serializable {
        private Long user;
        private String authority;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserAuthority)) return false;
        UserAuthority that = (UserAuthority) o;
        return user != null && authority != null &&
               user.equals(that.user) && authority.equals(that.authority);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}