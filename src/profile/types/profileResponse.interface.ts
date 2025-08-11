export interface ProfileResponseInterface {
    profile: {
        username: string;
        bio: string;
        image: string;
        following: boolean;
    };
}