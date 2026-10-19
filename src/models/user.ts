import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 254, unique: true })
  email!: string;

  @Column({ type: "varchar", select: false })
  passwordHash!: string;

  @Column({ type: "boolean", default: false })
  isLogout!: boolean;

  // Incremented on logout so signing in again cannot revive old tokens.
  @Column({ type: "integer", default: 0 })
  tokenVersion!: number;
}
