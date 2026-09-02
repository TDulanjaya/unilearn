package com.unilearn.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContactResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String photoUrl;
    private String lastMessage;
    private String lastMessageTime;
    private Integer unreadCount;
}
