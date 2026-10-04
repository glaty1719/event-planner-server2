import {
    CreateEventTagRequest,
    CreateLocationTagRequest,
    CreateUserEventTagData,
    CreateUserLocationTagRequest,
    EventTag,
    LocationTag,
    UserEventTag,
    UserLocationTag
} from "../types/event";
import {database} from "../configurations/db";
import {Knex} from "knex";
import {logger} from "../utils/logger";
import slugify from "slugify";
import {AppError} from "../utils/AppError";
import {httpCodes} from "../constants/httpCodes";

// create or update updated_at timestamp !!!
export const upsertLocationTag = async(data: CreateLocationTagRequest, trx?: Knex.Transaction) => {
    const { name } = data;
    const slug = slugify(name.trim(), {lower: true, strict: true});
    const db = trx || database;
    return await db<LocationTag>("location_tags")
        .insert({
            name: name.trim(),
            slug,
            updated_at: new Date()
        })
        .onConflict("slug")
        .merge({// modifies an insert query into an upsert operation
            updated_at: new Date()
        })
        .returning("*");
};

// create or update updated_at timestamp !!!
export const upsertUserLocationTag = async(data: CreateUserLocationTagRequest, trx?: Knex.Transaction) => {
    const { user_id, tag_id } = data;
    const db = trx || database;
    return await db<UserLocationTag>("user_location_tags")
        .insert({
            user_id,
            tag_id,
            updated_at: new Date()
        })
        .onConflict("tag_id")
        .merge({
            user_id,
            updated_at: new Date()
        })
        .returning("*");
};

// delete user_location_tag
// NOT TO BE USED
export const deleteUserLocationTag = async(user_id: number, tag_id: number) => {
    const result = await database<UserLocationTag>("user_location_tags")
        .where({user_id, tag_id})
        .del();

    if (result === 0) {
        logger.info(`[TAGS-SERVICES] [DELETE-USER-LOCATION-TAG] nothing to delete for user: ${user_id} and location_id: ${tag_id}`);
    }
}

export const fetchLocationTagId = async(name: string, trx?: Knex.Transaction) => {
    const slug = slugify(name.trim(), {lower: true, strict: true});
    const db = trx || database;
    const location_tag = await db<LocationTag>("location_tags")
        .where({ slug })
        .select("id")
        .first();
    if (!location_tag) {
        logger.error(`[TAGS-SERVICES] [FETCH-LOCATION-BY-ID] failed accessing location_tag`);
        throw new AppError("Failed accessing location. Please try again.", httpCodes.INTERNAL_SERVER_ERROR);
    }
    return location_tag.id;
}

// create or update updated_at timestamp !!!
export const upsertEventTag = async(data: CreateEventTagRequest, trx?: Knex.Transaction) => {
    const { name } = data;
    const slug = slugify(name.trim(), {lower: true, strict: true});
    const db = trx || database;

    return await db<EventTag>("event_tags")
        .insert({
            name: name.trim(),
            slug,
            updated_at: new Date()
        })
        .onConflict("slug")
        .merge({
            updated_at: new Date()
        })
        .returning("*");
};

// create or update updated_at timestamp !!!
export const upsertUserEventTag = async(data: CreateUserEventTagData, trx?: Knex.Transaction) => {
    const { user_id, event_id, tag_id } = data;
    const db = trx || database;
    return await db<UserEventTag>("user_event_tags")
        .insert({
            user_id,
            tag_id,
            event_id,
        })
        .onConflict(["user_id", "event_id", "tag_id"])
        .merge()
        .returning("*");
};

// fetches events_tag.tag_id
export const fetchEventTagId = async(name: string, trx?: Knex.Transaction) => {
    const slug = slugify(name.trim(), {lower: true, strict: true});
    const db = trx || database;
    const event_tag = await db<EventTag>("event_tags")
        .where({ slug })
        .select("id")
        .first();
    if (!event_tag) {
        logger.error(`[TAGS-SERVICES] [FETCH-EVENT-TAG-BY-ID] failed accessing event_tag`);
        throw new AppError("Failed accessing event tag. Please try again.", httpCodes.INTERNAL_SERVER_ERROR);
    }
    return event_tag.id;
}

/*// fetch event_tag by event_id
// DOESN'T MAKE SENSE, ONE EVENT HAS MANY TAGS...AND HOW TO SELECT ONLY ONE TAG???
export const fetchEventTagById = async(event_id: number, user_id: number, organizer_id: number, params: EventTagsQueryParams) => {
    const { fetchEventOrganizersTags } = params;
    let User_Id: number;
    if (fetchEventOrganizersTags) User_Id = organizer_id;
    // else fetch participant tags
    else User_Id = user_id;
    // HANDLE LATER

    // return event tags ( tags set by organizer or participant)
    return database("event_tags")
        //.join("user_event_tags", "event_tags.id", "=", "user_event_tags.tag_id")
        .join("user_event_tags", "event_tags.id", "user_event_tags.tag_id")
        .where("user_event_tags.user_id", User_Id)
        .andWhere("user_event_tags.event_id", event_id)
        .select<EventTagResponse>("event_tags.name", "event_tags.id")
        .first();
};*/

