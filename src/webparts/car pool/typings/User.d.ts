declare module 'UserTyping' {
 
        export interface AttachmentFile {
            FileName: string;
            ServerRelativeUrl: string;
        }
    
        export interface SharepointUser {
            Title: string;
        }
    
        export interface UserValue {
            AttachmentFiles: AttachmentFile[];
            SharepointUser: SharepointUser;
            Id: number;
            EMail: string;
            RoutingEnabled: boolean;
            Password: string;
            ID: number;
        }
    
        export interface UserListItemResponse {
            value: UserValue[];
    }

}

declare module 'ProfileImageResponse' {

    export interface FileNameAsPath {
        DecodedUrl: string;
    }

    export interface ServerRelativePath {
        DecodedUrl: string;
    }

    export interface ProfileImageItem {
        FileName: string;
        FileNameAsPath: FileNameAsPath;
        ServerRelativePath: ServerRelativePath;
        ServerRelativeUrl: string;
    }

}



