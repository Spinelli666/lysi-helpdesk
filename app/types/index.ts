import { User, Ticket, Subject, Comment } from '@prisma/client'

export type TicketWithRelations = Ticket & {
  createdBy: User
  subject: Subject
  comments: Comment[]
}
