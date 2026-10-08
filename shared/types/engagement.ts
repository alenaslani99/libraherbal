// Newsletter, product reviews and testimonials — API shapes. Dates are ISO strings.

// ----- reviews --------------------------------------------------------------------------

// An approved review on the product page; the name is shortened ("Milica P.")
export interface PublicReview {
  id: number
  author: string
  rating: number
  comment: string
  // the author has ordered this product (cancelled orders don't count)
  verified: boolean
  createdAt: string
}

// The signed-in customer's own review, approved or still waiting
export interface OwnReview {
  rating: number
  comment: string
  approved: boolean
  updatedAt: string
}

// GET /api/products/:slug/reviews
export interface ProductReviews {
  reviews: PublicReview[]
  // approved reviews only
  average: number
  count: number
  // how many 5★, 4★ … 1★ (index 0 = 5 stars)
  distribution: [number, number, number, number, number]
  // null for guests and for customers who haven't reviewed it
  mine: OwnReview | null
}

// GET /api/admin/reviews
export interface AdminReview {
  id: number
  rating: number
  comment: string
  approved: boolean
  verified: boolean
  productId: number
  productName: string
  productSlug: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string
}

// ----- testimonials ---------------------------------------------------------------------

// GET /api/testimonials — what the home page shows (max 3)
export interface Testimonial {
  id: number
  author: string
  text: string
  rating: number
}

// GET /api/admin/testimonials — all, in display order
export interface AdminTestimonial extends Testimonial {
  isActive: boolean
}

// ----- newsletter -----------------------------------------------------------------------

// POST /api/newsletter
export interface NewsletterResult {
  // the address was already subscribed before this request
  alreadySubscribed: boolean
}

// GET /api/admin/newsletter
export interface AdminSubscriber {
  id: number
  email: string
  source: 'footer' | 'section' | 'register'
  status: 'subscribed' | 'unsubscribed'
  createdAt: string
}
