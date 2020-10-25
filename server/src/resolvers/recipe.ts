import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import {getConnection} from "typeorm";
import {Recipe} from "../entities/Recipe";
import {Updoot} from "../entities/Updoot";
import {User} from "../entities/User";
import {isAuth} from "../middleware/isAuth";
import {MyContext} from "../types";

@InputType()
class RecipeInput {
  @Field()
  title: string;
  @Field()
  preparationTime: string;
  @Field()
  preparation: string;
}

@ObjectType()
class PaginatedRecipes {
  @Field(() => [Recipe])
  recipes: Recipe[];
  @Field()
  hasMore: boolean;
}

@Resolver(Recipe)
export class RecipeResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() recipe: Recipe) {
    return recipe.preparation.slice(0, 5000);
  }

  @FieldResolver(() => User)
  creator(@Root() recipe: Recipe, @Ctx() {userLoader}: MyContext) {
    return userLoader.load(recipe.creatorId);
  }

  @FieldResolver(() => Int, {nullable: true})
  async voteStatus(
    @Root() recipe: Recipe,
    @Ctx() {updootLoader, req}: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      recipeId: recipe.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("recipeId", () => Int) recipeId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() {req}: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const {userId} = req.session;

    const updoot = await Updoot.findOne({where: {recipeId, userId}});

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
            `update updoot set value = $1 where "recipeId" = $2 and "userId" = $3`,
          [realValue, recipeId, userId]
        );

        await tm.query(
            `update recipe set points = points + $1 where id = $2`,
          [2 * realValue, recipeId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
            `insert into updoot ("userId", "recipeId", value) values ($1, $2, $3)`,
          [userId, recipeId, realValue]
        );

        await tm.query(
            `update recipe set points = points + $1 where id = $2`,
          [realValue, recipeId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedRecipes)
  async recipes(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {nullable: true}) cursor: string | null
  ): Promise<PaginatedRecipes> {
    // 20 -> 21
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;
    const replacements: any[] = [reaLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const recipes = await getConnection().query(
      `select r.* from recipe r ${cursor ? `where p."createdAt" < $2` : ""} order by p."createdAt" DESC limit $1`,
      replacements
    );

    return {
      recipes: recipes.slice(0, realLimit),
      hasMore: recipes.length === reaLimitPlusOne,
    };
  }

  @Query(() => Recipe, {nullable: true})
  recipe(@Arg("id", () => Int) id: number): Promise<Recipe | undefined> {
    return Recipe.findOne(id);
  }

  @Mutation(() => Recipe)
  @UseMiddleware(isAuth)
  async createRecipe(
    @Arg("input") input: RecipeInput,
    @Ctx() {req}: MyContext
  ): Promise<Recipe> {
    return Recipe.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Recipe, {nullable: true})
  @UseMiddleware(isAuth)
  async updateRecipe(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("preparation") preparation: string,
    @Arg("preparationTime") preparationTime: string,
    @Ctx() {req}: MyContext
  ): Promise<Recipe | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Recipe)
      .set({title, preparation, preparationTime})
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteRecipe(
    @Arg("id", () => Int) id: number,
    @Ctx() {req}: MyContext
  ): Promise<boolean> {
    await Recipe.delete({id, creatorId: req.session.userId});

    return true;
  }
}
