import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Activity } from './activity.schema';

@ObjectType({
  description: 'Paginated list of activities with metadata',
})
export class PaginatedActivities {
  @Field(() => [Activity], {
    description: 'List of activities for the current page',
  })
  items!: Activity[];

  @Field(() => Int, { description: 'Total number of activities' })
  total!: number;

  @Field(() => Int, { description: 'Current page number' })
  page!: number;

  @Field(() => Int, { description: 'Number of items per page' })
  limit!: number;

  @Field(() => Int, { description: 'Total number of pages' })
  totalPages!: number;
}
