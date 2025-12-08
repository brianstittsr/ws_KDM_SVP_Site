/**
 * Firestore Database Schema for Strategic Value Plus Platform
 * 
 * This file defines the database collections, document structures,
 * and helper types for Firestore integration.
 */

import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  User,
  Organization,
  Opportunity,
  Project,
  Meeting,
  ActionItem,
  Rock,
  Document as AppDocument,
  Service,
  Certification,
  Capability,
  Activity,
  Note,
  Milestone,
  RockMilestone,
} from "@/types";

// ============================================================================
// Firestore Document Types (with Timestamp instead of Date)
// ============================================================================

/** Base document fields for all collections */
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/** User document in Firestore */
export interface UserDoc extends Omit<User, "createdAt" | "lastActive" | "capabilities"> {
  createdAt: Timestamp;
  lastActive: Timestamp;
  capabilities?: string[]; // Reference IDs to capabilities subcollection
}

/** Organization document in Firestore */
export interface OrganizationDoc extends Omit<Organization, "createdAt" | "contacts" | "capabilities" | "certifications"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  contactIds?: string[]; // Reference IDs to users
  capabilityIds?: string[]; // Reference IDs
  certificationIds?: string[]; // Reference IDs
}

/** Opportunity document in Firestore */
export interface OpportunityDoc extends Omit<Opportunity, "createdAt" | "updatedAt" | "expectedCloseDate" | "owner" | "assignedAffiliates" | "organization" | "services" | "notes" | "activities"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expectedCloseDate: Timestamp;
  ownerId: string; // Reference to user
  assignedAffiliateIds?: string[]; // Reference IDs to users
  serviceIds: string[]; // Reference IDs to services
}

/** Project document in Firestore */
export interface ProjectDoc extends Omit<Project, "createdAt" | "startDate" | "endDate" | "team" | "organization" | "milestones" | "documents" | "meetings"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startDate: Timestamp;
  endDate?: Timestamp;
  teamIds: string[]; // Reference IDs to users
}

/** Meeting document in Firestore */
export interface MeetingDoc extends Omit<Meeting, "date" | "attendees" | "actionItems"> {
  date: Timestamp;
  attendeeIds: string[]; // Reference IDs to users
}

/** Action Item document in Firestore */
export interface ActionItemDoc extends Omit<ActionItem, "createdAt" | "dueDate" | "assignee"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate?: Timestamp;
  assigneeId: string; // Reference to user
}

/** Rock (90-day goal) document in Firestore */
export interface RockDoc extends Omit<Rock, "createdAt" | "owner" | "milestones"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId: string; // Reference to user
}

/** Document/File document in Firestore */
export interface DocumentDoc extends Omit<AppDocument, "createdAt" | "uploadedBy"> {
  createdAt: Timestamp;
  uploadedById: string; // Reference to user
  storagePath: string; // Firebase Storage path
}

/** Service document in Firestore */
export interface ServiceDoc extends Service {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

/** Certification document in Firestore */
export interface CertificationDoc extends Omit<Certification, "dateObtained" | "expirationDate"> {
  dateObtained: Timestamp;
  expirationDate?: Timestamp;
  organizationId: string; // Parent organization
}

/** Activity document in Firestore */
export interface ActivityDoc extends Omit<Activity, "createdAt" | "user"> {
  createdAt: Timestamp;
  userId: string; // Reference to user
  entityType: "opportunity" | "project" | "organization";
  entityId: string;
}

/** Note document in Firestore */
export interface NoteDoc extends Omit<Note, "createdAt" | "updatedAt" | "author"> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  authorId: string; // Reference to user
  entityType: "opportunity" | "project" | "meeting";
  entityId: string;
}

/** Milestone document in Firestore */
export interface MilestoneDoc extends Omit<Milestone, "dueDate" | "completedDate"> {
  dueDate: Timestamp;
  completedDate?: Timestamp;
}

/** Rock Milestone document in Firestore */
export interface RockMilestoneDoc extends Omit<RockMilestone, "completedDate"> {
  completedDate?: Timestamp;
  rockId: string;
}

// ============================================================================
// Collection Names
// ============================================================================

export const COLLECTIONS = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  OPPORTUNITIES: "opportunities",
  PROJECTS: "projects",
  MEETINGS: "meetings",
  ACTION_ITEMS: "actionItems",
  ROCKS: "rocks",
  DOCUMENTS: "documents",
  SERVICES: "services",
  CERTIFICATIONS: "certifications",
  ACTIVITIES: "activities",
  NOTES: "notes",
  MILESTONES: "milestones",
  ROCK_MILESTONES: "rockMilestones",
  CAPABILITIES: "capabilities",
} as const;

// ============================================================================
// Collection References
// ============================================================================

/** Get typed collection reference */
export const getCollection = <T>(collectionName: string): CollectionReference<T> => {
  return collection(db, collectionName) as CollectionReference<T>;
};

/** Get typed document reference */
export const getDocRef = <T>(collectionName: string, docId: string): DocumentReference<T> => {
  return doc(db, collectionName, docId) as DocumentReference<T>;
};

// Pre-typed collection references
export const usersCollection = () => getCollection<UserDoc>(COLLECTIONS.USERS);
export const organizationsCollection = () => getCollection<OrganizationDoc>(COLLECTIONS.ORGANIZATIONS);
export const opportunitiesCollection = () => getCollection<OpportunityDoc>(COLLECTIONS.OPPORTUNITIES);
export const projectsCollection = () => getCollection<ProjectDoc>(COLLECTIONS.PROJECTS);
export const meetingsCollection = () => getCollection<MeetingDoc>(COLLECTIONS.MEETINGS);
export const actionItemsCollection = () => getCollection<ActionItemDoc>(COLLECTIONS.ACTION_ITEMS);
export const rocksCollection = () => getCollection<RockDoc>(COLLECTIONS.ROCKS);
export const documentsCollection = () => getCollection<DocumentDoc>(COLLECTIONS.DOCUMENTS);
export const servicesCollection = () => getCollection<ServiceDoc>(COLLECTIONS.SERVICES);
export const activitiesCollection = () => getCollection<ActivityDoc>(COLLECTIONS.ACTIVITIES);
export const notesCollection = () => getCollection<NoteDoc>(COLLECTIONS.NOTES);

// ============================================================================
// Subcollection Helpers
// ============================================================================

/** Get milestones subcollection for a project */
export const projectMilestonesCollection = (projectId: string) => {
  return collection(db, COLLECTIONS.PROJECTS, projectId, "milestones") as CollectionReference<MilestoneDoc>;
};

/** Get action items subcollection for a meeting */
export const meetingActionItemsCollection = (meetingId: string) => {
  return collection(db, COLLECTIONS.MEETINGS, meetingId, "actionItems") as CollectionReference<ActionItemDoc>;
};

/** Get milestones subcollection for a rock */
export const rockMilestonesCollection = (rockId: string) => {
  return collection(db, COLLECTIONS.ROCKS, rockId, "milestones") as CollectionReference<RockMilestoneDoc>;
};

/** Get certifications subcollection for an organization */
export const organizationCertificationsCollection = (orgId: string) => {
  return collection(db, COLLECTIONS.ORGANIZATIONS, orgId, "certifications") as CollectionReference<CertificationDoc>;
};

/** Get capabilities subcollection for an organization */
export const organizationCapabilitiesCollection = (orgId: string) => {
  return collection(db, COLLECTIONS.ORGANIZATIONS, orgId, "capabilities") as CollectionReference<Capability>;
};

// ============================================================================
// Utility Functions
// ============================================================================

/** Convert Date to Firestore Timestamp */
export const toTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/** Convert Firestore Timestamp to Date */
export const fromTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

/** Generate a new document ID */
export const generateId = (collectionName: string): string => {
  return doc(collection(db, collectionName)).id;
};

// ============================================================================
// Database Schema Documentation
// ============================================================================

/**
 * FIRESTORE DATABASE STRUCTURE
 * ============================
 * 
 * /users/{userId}
 *   - UserDoc
 * 
 * /organizations/{orgId}
 *   - OrganizationDoc
 *   /certifications/{certId} - CertificationDoc
 *   /capabilities/{capId} - Capability
 * 
 * /opportunities/{oppId}
 *   - OpportunityDoc
 * 
 * /projects/{projectId}
 *   - ProjectDoc
 *   /milestones/{milestoneId} - MilestoneDoc
 * 
 * /meetings/{meetingId}
 *   - MeetingDoc
 *   /actionItems/{actionId} - ActionItemDoc
 * 
 * /rocks/{rockId}
 *   - RockDoc
 *   /milestones/{milestoneId} - RockMilestoneDoc
 * 
 * /documents/{docId}
 *   - DocumentDoc
 * 
 * /services/{serviceId}
 *   - ServiceDoc
 * 
 * /activities/{activityId}
 *   - ActivityDoc (polymorphic, linked to various entities)
 * 
 * /notes/{noteId}
 *   - NoteDoc (polymorphic, linked to various entities)
 * 
 * /actionItems/{actionId}
 *   - ActionItemDoc (top-level for cross-entity queries)
 * 
 * 
 * SECURITY RULES CONSIDERATIONS
 * =============================
 * - Users can only read/write their own user document
 * - Organization members can read organization data
 * - Admins have full access to all collections
 * - Affiliates can only access assigned opportunities/projects
 * - Documents inherit permissions from parent entity
 * 
 * 
 * INDEXES REQUIRED
 * ================
 * - opportunities: organizationId + stage (composite)
 * - opportunities: ownerId + expectedCloseDate (composite)
 * - projects: organizationId + status (composite)
 * - activities: entityType + entityId + createdAt (composite)
 * - actionItems: assigneeId + status + dueDate (composite)
 * - rocks: ownerId + quarter (composite)
 */
