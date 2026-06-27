export enum Roles {
  ORGANIZER = "organizer",
  USER = "user",
}



export interface JwtPayload {
  user_id: string;
  role: Roles;
}


export interface RequestWithUser extends Request {
  user: JwtPayload;
}
