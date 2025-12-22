import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  Parent,
  ResolveField,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { Activity } from './activity.schema';

import { CreateActivityInput } from './activity.inputs.dto';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { PaginatedActivities } from './activity.types';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly userServices: UserService,
  ) {}

  @ResolveField(() => ID)
  id(@Parent() activity: Activity): string {
    return activity._id.toString();
  }

  @ResolveField(() => User)
  async owner(@Parent() activity: Activity): Promise<User> {
    await activity.populate('owner');
    return activity.owner;
  }

  @Query(() => PaginatedActivities, {
    description: 'Get all activities with pagination',
  })
  async getActivities(
    @Args({ name: 'page', type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args({ name: 'limit', type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ): Promise<PaginatedActivities> {
    return this.activityService.findAll(page, limit);
  }

  @Query(() => [Activity], {
    description: 'Get the 3 latest activities',
  })
  async getLatestActivities(): Promise<Activity[]> {
    return this.activityService.findLatest();
  }

  @Query(() => PaginatedActivities, {
    description: 'Get activities created by the authenticated user',
  })
  @UseGuards(AuthGuard)
  async getActivitiesByUser(
    @Context() context: ContextWithJWTPayload,
    @Args({ name: 'page', type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args({ name: 'limit', type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ): Promise<PaginatedActivities> {
    return this.activityService.findByUser(context.jwtPayload.id, page, limit);
  }

  @Query(() => [String], {
    description: 'Get list of all cities where activities are available',
  })
  async getCities(): Promise<string[]> {
    const cities = await this.activityService.findCities();
    return cities;
  }

  @Query(() => PaginatedActivities, {
    description:
      'Get activities filtered by city, with optional filters for activity name and price',
  })
  async getActivitiesByCity(
    @Args('city', { description: 'City name to filter activities' })
    city: string,
    @Args({ name: 'page', type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args({ name: 'limit', type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
    @Args({
      name: 'activity',
      nullable: true,
      description: 'Filter by activity name (partial match)',
    })
    activity?: string,
    @Args({
      name: 'price',
      nullable: true,
      type: () => Int,
      description: 'Filter by exact price',
    })
    price?: number,
  ): Promise<PaginatedActivities> {
    return this.activityService.findByCity(city, activity, price, page, limit);
  }

  @Query(() => Activity, {
    description: 'Get a single activity by ID',
  })
  async getActivity(
    @Args('id', { description: 'Activity ID' }) id: string,
  ): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Mutation(() => Activity, {
    description: 'Create a new activity (requires authentication)',
  })
  @UseGuards(AuthGuard)
  async createActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('createActivityInput', { description: 'Activity data' })
    createActivity: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(context.jwtPayload.id, createActivity);
  }
}
