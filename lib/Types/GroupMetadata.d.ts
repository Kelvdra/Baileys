import type { Contact } from './Contact.js';
import type { WAMessageAddressingMode } from './Message.js';
export type GroupParticipant = Contact & {
    /** PN/JID result. If WA returns @lid with phone_number, this is normalized to @s.whatsapp.net */
    jid?: string;
    /** display/notify name returned by WhatsApp participant node */
    username?: string;
    waUsername?: string;
    name?: string;
    notify?: string;
    /** best display name after metadata/contact-cache enrichment */
    displayName?: string;
    /** original LID when WhatsApp returns LID addressing */
    lid?: string;
    /** PN JID when available */
    phoneNumber?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    admin?: 'admin' | 'superadmin' | null;
};
export type ParticipantAction = 'add' | 'remove' | 'promote' | 'demote' | 'modify';
export type RequestJoinAction = 'created' | 'revoked' | 'rejected';
export type RequestJoinMethod = 'invite_link' | 'linked_group_join' | 'non_admin_add' | undefined;
export interface GroupMetadata {
    id: string;
    notify?: string;
    /** group uses 'lid' or 'pn' to send messages */
    addressingMode?: WAMessageAddressingMode;
    owner: string | undefined;
    ownerPn?: string | undefined;
    ownerLid?: string | undefined;
    owner_country_code?: string | undefined;
    subject: string;
    /** group subject owner */
    subjectOwner?: string;
    subjectOwnerPn?: string;
    subjectOwnerLid?: string;
    /** group subject modification date */
    subjectTime?: number;
    creation?: number;
    desc?: string;
    descOwner?: string;
    descOwnerPn?: string;
    descOwnerLid?: string;
    descId?: string;
    descTime?: number;
    /** if this group is part of a community, it returns the jid of the community to which it belongs */
    linkedParent?: string;
    /** is set when the group only allows admins to change group settings */
    restrict?: boolean;
    /** is set when the group only allows admins to write messages */
    announce?: boolean;
    /** is set when the group also allows members to add participants */
    memberAddMode?: boolean;
    /** Request approval to join the group */
    joinApprovalMode?: boolean;
    /** is this a community */
    isCommunity?: boolean;
    /** is this the announce of a community */
    isCommunityAnnounce?: boolean;
    /** number of group participants */
    size?: number;
    participants: GroupParticipant[];
    ephemeralDuration?: number;
    inviteCode?: string;
    /** the person who added you to group or changed some setting in group */
    author?: string;
    authorPn?: string;
}
export interface WAGroupCreateResponse {
    status: number;
    gid?: string;
    participants?: [{
        [key: string]: {};
    }];
}
export interface GroupModificationResponse {
    status: number;
    participants?: {
        [key: string]: {};
    };
}
//# sourceMappingURL=GroupMetadata.d.ts.map