"use client";

import { GridMatrixIcon, WaveSquareIcon } from "../../svg-icons";
import Image from "next/image";
import AddReviewForm from "./AddReviewForm";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgVideo from "lightgallery/plugins/video";
import "@/lib/lightgallery-styles";
import {
  REVIEW_MEDIA_ITEMS,
  PRODUCT_FEATURES,
  PRODUCT_SPECIFICATIONS,
  type ProductSpecification,
  productReviews,
  productFaqs,
} from "@/data/productDetails";
import { useState } from "react";

export default function DescriptionTab1({
  description,
  parentClass = "rbt-tab rbt-product-single-details-tab rbt-fshape-tab",
}: {
  description?: string;
  parentClass?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    "description" | "specification" | "reviews" | "question"
  >("description");

  return (
    <>
      <div className={parentClass}>
        <div className="rbt-tab-nav-wrapper">
          <ul
            className="nav nav-tabs"
            id="rbt-single-productTab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={`nav-link${activeTab === "description" ? " active" : ""}`}
                onClick={() => {
                  setActiveTab("description");
                }}
              >
                Description
                <span className="rbt-fshape-portion rbt-fshape-left-portion">
                  <GridMatrixIcon />
                </span>
                <span className="rbt-fshape-portion rbt-fshape-right-portion">
                  <WaveSquareIcon />
                </span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={`nav-link${activeTab === "specification" ? " active" : ""}`}
                onClick={() => {
                  setActiveTab("specification");
                }}
              >
                Specification
                <span className="rbt-fshape-portion rbt-fshape-left-portion">
                  <GridMatrixIcon />
                </span>
                <span className="rbt-fshape-portion rbt-fshape-right-portion">
                  <WaveSquareIcon />
                </span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={`nav-link${activeTab === "reviews" ? " active" : ""}`}
                onClick={() => {
                  setActiveTab("reviews");
                }}
              >
                Reviews
                <span className="rbt-fshape-portion rbt-fshape-left-portion">
                  <GridMatrixIcon />
                </span>
                <span className="rbt-fshape-portion rbt-fshape-right-portion">
                  <WaveSquareIcon />
                </span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={`nav-link${activeTab === "question" ? " active" : ""}`}
                onClick={() => {
                  setActiveTab("question");
                }}
              >
                Questions
                <span className="rbt-fshape-portion rbt-fshape-left-portion">
                  <GridMatrixIcon />
                </span>
                <span className="rbt-fshape-portion rbt-fshape-right-portion">
                  <WaveSquareIcon />
                </span>
              </button>
            </li>
          </ul>
        </div>
        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-pane fade active show">
              <div className="rbt-product-single-description">
                {description?.trim() ? (
                  <p className="rbt-block-desc b1 mb--0 mt--12">
                    {description}
                  </p>
                ) : (
                  <>
                    <h6 className="rbt-block-title mb--0">Immersive visuals</h6>
                    <p className="rbt-block-desc b1 mb--0 mt--12">
                      Quisque varius diam vel metus mattis, id aliquam diam
                      rhoncus. Proin vitae magna in dui finibus malesuada et at
                      nulla. Morbi elit ex, viverra vitae ante vel, blandit
                      feugiat ligula. Fusce fermentum iaculis nibh, at sodales
                      leo maximus a. Nullam ultricies sodales nunc, in
                      pellentesque lorem mattis quis. Cras imperdiet est in nunc
                      tristique lacinia. Nullam aliquam mauris eu accumsan
                      tincidunt. Suspendisse velit ex, aliquet vel ornare vel,
                      dignissim a tortor. Morbi ut sapien vitae odio accumsan
                      gravida. Morbi vitae erat auctor, eleifend nunc a,
                      lobortis neque. Praesent aliquam dignissim viverra.
                      Maecenas lacus odio, feugiat eu nunc sit amet, maximus
                      sagittis dolor.
                    </p>
                  </>
                )}
                {!description?.trim() ? (
                  <>
                    <div className="rbt-block-banner-img mt--32">
                      <Image
                        alt="Ecommerce Product Banner"
                        src="/assets/images/product-single/single-prd-banner/single-prd-banner-01.webp"
                        width={1840}
                        height={844}
                      />
                    </div>
                    <p className="rbt-block-desc b1 mb--0 mt--12">
                      Quisque varius diam vel metus mattis, id aliquam diam
                      rhoncus. Proin vitae magna in dui finibus malesuada et at
                      nulla. Morbi elit ex, viverra vitae ante vel, blandit
                      feugiat ligula. Fusce fermentum iaculis nibh, at sodales
                      leo maximus a. Nullam ultricies sodales nunc, in
                      pellentesque lorem mattis quis. Cras imperdiet est in nunc
                      tristique lacinia. Nullam aliquam mauris eu accumsan
                      tincidunt. Suspendisse velit ex, aliquet vel ornare vel,
                      dignissim a tortor. Morbi ut sapien vitae odio accumsan
                      gravida. Morbi vitae erat auctor, eleifend nunc a,
                      lobortis neque. Praesent aliquam dignissim viverra.
                      Maecenas lacus odio, feugiat eu nunc sit amet, maximus
                      sagittis dolor.
                    </p>
                    <p className="rbt-block-desc b1 mb--0 mt--12">
                      sunt in culpa qui officia deserunt mollit anim id est
                      laborum.nunc, in pellentesque lorem mattis quis. Cras
                      imperdiet est in nunc tristique lacinia. Nullam aliquam
                      mauris eu accumsan tincidunt. Suspendisse velit ex,
                      aliquet vel ornare vel, dignissim a tortor. Morbi ut
                      sapien vitae odio accumsan gravida. Morbi vitae erat
                      auctor, eleifend nunc a, lobortis neque. Praesent aliquam
                      dignissim viverra. Maecenas lacus odio, feugiat eu nunc
                      sit
                    </p>
                    <div className="rbt-block-banner-video mt--32">
                      <video
                        src="/assets/videos/prd-single-dtls-video-01.mp4"
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                      />
                    </div>
                    <div className="rbt-prd-feature-area mt--32">
                      <div className="row row--12 mt_dec--24 rbt-mobile-row">
                        {PRODUCT_FEATURES.map((feature, index) => (
                          <div
                            className="col-lg-4 col-md-4 col-sm-6 col-12 mt--24"
                            key={index}
                          >
                            <div className="rbt-prd-feature-card rbt-bg-color-brand-50 rbt-curved-style-box">
                              <div className="rbt-inner text-center">
                                <span className="icon">
                                  <i className={feature.icon} />
                                </span>
                                <p className="title b1">{feature.title}</p>
                                <p className="desc b2">{feature.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="rbt-block-desc b1 mb--0 mt--12">
                      Egestas purus a luctus ridiculus ac malesuada arcu a.
                      Euismod dapibus commodo metus phasellus blandit
                      suspendisse euismod orci tellus. Habitasse hendrerit dolor
                      euismod varius nisi. Platea praesent nisi ultrices rhoncus
                      volutpat nostra. Efficitur dui nec massa nulla nostra nunc
                      massa ornare fermentum. Parturient turpis per adipiscing
                      vestibulum donec tincidunt ligula. Purus tristique ut
                      dolor mollis ut cras scelerisque nec. Massa dis mus
                      senectus tortor ligula. Ullamcorper molestie placerat
                      bibendum hac aptent volutpat ad laoreet
                    </p>
                    <p className="rbt-block-desc b1 mb--0 mt--12">
                      Scelerisque sociosqu sagittis bibendum quam id; ultrices
                      placerat adipiscing. Imperdiet egestas ullamcorper cras
                      blandit himenaeos auctor lacus commodo. Feugiat quisque
                      nascetur tincidunt duis phasellus, sagittis euismod. Donec
                      nisl senectus risus nullam quisque vivamus. Dapibus
                      pulvinar lobortis auctor quam neque. Nibh at maximus
                      taciti mattis rutrum viverra. Dictum ipsum tortor nibh
                      parturient laoreet ullamcorper rhoncus tincidunt. At risus
                      aliquam ligula ut vivamus mi sodales volutpat. Cursus
                      sodales hendrerit donec efficitur penatibus.
                    </p>
                    <div className="rbt-block-banner-img mt--32">
                      <Image
                        alt="Ecommerce Product Banner"
                        src="/assets/images/product-single/single-prd-banner/single-prd-banner-02.webp"
                        width={1840}
                        height={844}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
          {activeTab === "specification" && (
            <div className="tab-pane fade active show">
              <div className="rbt-prd-single-specification-info">
                {PRODUCT_SPECIFICATIONS.map(
                  (spec: ProductSpecification, index: number) => (
                    <div className="rbt-single-specification" key={index}>
                      <label className="b1 title">{spec.label}</label>
                      <div className="rbt-specification-content">
                        <span className="desc">{spec.value}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="tab-pane fade active show">
              <div className="rbt-product-single-reviews-area">
                <div className="rbt-review-statistics-section">
                  <div className="row row--12 mt_dec--24">
                    <div className="col-md-6 mt--24">
                      <div className="rbt-avr-review">
                        <span className="rbt-abr-review-number-text">4.33</span>
                        <div className="rbt-abr-review-content">
                          <ul className="rbt-rating-icon-list">
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star" />
                            </li>
                            <li>
                              <i className="fa-solid fa-star" />
                            </li>
                          </ul>
                          <p className="rating-text b3 mt--8 rbt-text-color-gray-700">
                            Based on 19 Review
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mt--24">
                      <div className="rbt-rating-breakdown">
                        {[
                          { star: 5, val: 50, count: 6 },
                          { star: 4, val: 25, count: 4 },
                          { star: 3, val: 75, count: 6 },
                          { star: 2, val: 75, count: 6 },
                          { star: 1, val: 50, count: 9 },
                        ].map((item) => (
                          <div className="rbt-rating-item" key={item.star}>
                            <span className="icon">
                              <i className="fa-solid fa-star rbt-rated-icon" />
                            </span>
                            <span className="number-text">{item.star}</span>
                            <div
                              className="progress"
                              role="progressbar"
                              aria-label="Shipping-progress"
                              aria-valuenow={item.val}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div className={`progress-bar w-${item.val}`} />
                            </div>
                            <span className="number-text">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rbt-prd-single-reviews-list-area">
                <ul className="rbt-comment-list">
                  {productReviews.map((review) => (
                    <li className="comment" key={review.id}>
                      <div className="comment-body">
                        <div className="single-comment">
                          <div className="comment-img">
                            <Image
                              alt="Author Images"
                              src={review.imgSrc}
                              width={96}
                              height={96}
                            />
                          </div>
                          <div className="comment-inner">
                            <ul className="rbt-rating-icon-list">
                              {[...Array(5)].map((_, i) => (
                                <li key={i}>
                                  <i
                                    className={`fa-solid fa-star${i < review.rating ? " rbt-rated-icon" : ""}`}
                                  />
                                </li>
                              ))}
                            </ul>
                            <div className="comment-meta">
                              <div className="time-spent">{review.date}</div>
                            </div>
                            <div className="comment-text">
                              <p className="title">{review.title}</p>
                              <p className="b1">{review.desc}</p>
                              {review.hasMedia && (
                                <LightGallery
                                  plugins={[lgThumbnail, lgZoom, lgVideo]}
                                  elementClassNames="rbt-review-gallery"
                                  speed={400}
                                  selector=".rbt-commented-img-list > li > a"
                                  zoomFromOrigin={false}
                                  autoplayVideoOnSlide
                                >
                                  <ul className="rbt-commented-img-list">
                                    {REVIEW_MEDIA_ITEMS.map((item, index) =>
                                      item.type === "image" ? (
                                        <li key={item.id}>
                                          <a
                                            href={item.thumbSrc}
                                            data-src={item.thumbSrc}
                                            className={`rbt-commented-img${
                                              index === 3
                                                ? " has-more-link"
                                                : ""
                                            }`}
                                            data-black-overlay={
                                              index === 3 ? 7 : undefined
                                            }
                                            data-sub-html={item.alt}
                                          >
                                            <Image
                                              alt={item.alt}
                                              src={item.thumbSrc}
                                              width={3024}
                                              height={4032}
                                            />
                                            {index === 3 && (
                                              <span className="text">
                                                {" "}
                                                +5 Images{" "}
                                              </span>
                                            )}
                                          </a>
                                        </li>
                                      ) : (
                                        <li key={item.id}>
                                          <a
                                            className="rbt-commented-img"
                                            role="button"
                                            tabIndex={0}
                                            data-poster={item.thumbSrc}
                                            data-video={JSON.stringify({
                                              source: [
                                                {
                                                  src: item.src,
                                                  type: "video/webm",
                                                },
                                              ],
                                              attributes: {
                                                controls: true,
                                                playsInline: true,
                                                preload: "metadata",
                                              },
                                            })}
                                            data-sub-html={item.alt}
                                          >
                                            <Image
                                              alt={item.alt}
                                              src={item.thumbSrc}
                                              width={3024}
                                              height={4032}
                                            />
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </LightGallery>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <AddReviewForm />
            </div>
          )}
          {activeTab === "question" && (
            <div className="tab-pane fade active show">
              <div className="rbt-prd-single-faq-section">
                <div className="rbt-section-title-area rbt-bg-color-gray-light">
                  <h6 className="rbt-block-title mb--0">
                    Frequently Asked Questions? Look here
                  </h6>
                </div>
                <div className="rbt-accordion-style rbt-accordion-01 accordion">
                  <div className="accordion" id="accordionExampleb4">
                    {productFaqs.map((faq, index) => (
                      <div className="accordion-item card" key={faq.id}>
                        <h2
                          className="accordion-header card-header"
                          id={`heading${index}`}
                        >
                          <button
                            className={`accordion-button${index !== 0 ? " collapsed" : ""}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${faq.id}`}
                            aria-expanded={index === 0 ? "true" : "false"}
                            aria-controls={faq.id}
                          >
                            {faq.question}
                          </button>
                        </h2>
                        <div
                          id={faq.id}
                          className={`accordion-collapse collapse${index === 0 ? " show" : ""}`}
                          aria-labelledby={`heading${index}`}
                          data-bs-parent="#accordionExampleb4"
                        >
                          <div className="accordion-body card-body">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
