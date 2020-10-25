import {Entity, BaseEntity, ManyToOne, PrimaryColumn, Column} from "typeorm";
import {User} from "./User";
import {Recipe} from "./Recipe";

@Entity()
export class Updoot extends BaseEntity {
  @Column({type: "int"})
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @PrimaryColumn()
  recipeId: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.updoots, {
    onDelete: "CASCADE",
  })

  recipe: Recipe;
}
