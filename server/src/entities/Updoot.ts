import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./User";
import { Recipe } from "./Recipe";

// m to n
// many to many
// user <-> recipes
// user -> join table <- recipes
// user -> updoot <- recipes

@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: "int" })
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
