import { Document} from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User extends Document {
  @Prop({ type: String, required: true, unique: true, message: "This username is already used" })
  username: string;
  @Prop({ type: String, required: true, unique: true, message: "This email is already used" })
  email: string;
  @Prop({ type: String, required: true })
  birthDate: Date;
  @Prop({ type: String, required: true })
  salt: string;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: String })
  refreshToken: string;
}

const schema = SchemaFactory.createForClass(User);
export const UserSchema = schema;
