import {ObjectType, Field, Int} from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import {User} from "./User";
import {Updoot} from "./Updoot";

@ObjectType()
@Entity()
export class Recipe extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  preparationTime!: string;

  @Field()
  @Column()
  preparation!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;

  @Field(() => Int, {nullable: true})
  voteStatus: number | null; // 1 or -1 or null

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.recipes)
  creator: User;

  @OneToMany(() => Updoot, (updoot) => updoot.recipe)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
