import {ObjectType, Field} from "type-graphql";
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity, PrimaryGeneratedColumn, Column,
} from "typeorm";

@ObjectType()
@Entity()
export class Ingredient extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  amount!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
