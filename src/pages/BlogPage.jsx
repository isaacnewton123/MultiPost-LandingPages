import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { getAllPosts, getCategories, formatDate } from '../utils/blog';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import { m } from 'framer-motion';

// Icons
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const POSTS_PER_PAGE = 6;
const DOMAIN = 'https://multipost.pro';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ── Helper: build crawlable href for a given page number ──────────
const pageHref = (page) => (page <= 1 ? '/blog' : `/blog?page=${page}`);
const fullPageHref = (page) => `${DOMAIN}${pageHref(page)}`;

const BlogPage = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Pagination from URL ──────────────────────────────────────────
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const allPosts = getAllPosts();
  const categories = getCategories();

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return allPosts;
    return allPosts.filter((p) => p.category === activeCategory);
  }, [allPosts, activeCategory]);

  // ── True page-sliced pagination (NOT accumulating) ───────────────
  const isFiltered = activeCategory !== 'All';
  const totalPages = isFiltered
    ? 1
    : Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // Clamp page to valid range
  const safePage = Math.min(currentPage, totalPages);

  const visiblePosts = isFiltered
    ? filteredPosts
    : filteredPosts.slice(
        (safePage - 1) * POSTS_PER_PAGE,
        safePage * POSTS_PER_PAGE
      );

  const hasPrev = !isFiltered && safePage > 1;
  const hasNext = !isFiltered && safePage < totalPages;

  // ── Handlers ─────────────────────────────────────────────────────
  const navigateToPage = useCallback(
    (page) => (e) => {
      e.preventDefault();
      setSearchParams(page <= 1 ? {} : { page: String(page) }, { replace: false });
      // Smooth scroll to the blog grid
      document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [setSearchParams]
  );

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'All' && currentPage !== 1) {
      setSearchParams({}, { replace: true });
    }
  };

  // Scroll to top on page change (for direct URL navigation / SSR)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [safePage]);

  // ── SEO helpers ──────────────────────────────────────────────────
  const seoPath = safePage > 1 ? `/blog?page=${safePage}` : '/blog';
  const prevHref = hasPrev ? fullPageHref(safePage - 1) : null;
  const nextHref = hasNext ? fullPageHref(safePage + 1) : null;

  // Build visible page numbers with ellipsis for large sets
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = [];
    pages.push(1);

    if (safePage > 3) pages.push('...');

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (safePage < totalPages - 2) pages.push('...');

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <SEO
        title={
          safePage > 1
            ? `Blog — Page ${safePage}`
            : 'Blog — Free Auto Posting Tips & Video Distribution'
        }
        description="Tips, strategies, and insights on multi-platform content distribution, free auto posting, short-form video optimization, and social media growth with unlimited platform connections."
        path={seoPath}
      />
      {/* Pagination link hints for crawlers */}
      <Helmet>
        {prevHref && <link rel="prev" href={prevHref} />}
        {nextHref && <link rel="next" href={nextHref} />}
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          py: 12,
          pt: { xs: 18, md: 20 },
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box
            component={m.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
          >
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                mb: 2,
              }}
            >
              MultiPost{' '}
              <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                Blog
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                mb: 6,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Tips, strategies, and insights to help you streamline your content
              creation and maximize your social media presence.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Blog Content Section */}
      <Box
        sx={{
          py: 10,
          backgroundColor: theme.palette.background.default,
          position: 'relative',
          zIndex: 1,
          mt: -6,
          borderRadius: '20px 20px 0 0',
        }}
      >
        <Container maxWidth="lg">
          {/* Category filters */}
          <Box
            component={m.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ mb: 6, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                color={activeCategory === category ? 'primary' : 'default'}
                onClick={() => handleCategoryChange(category)}
                sx={{
                  m: 0.5,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              />
            ))}
          </Box>

          {/* Blog posts grid */}
          <Grid
            id="blog-grid"
            container
            spacing={4}
            component={m.div}
            key={safePage} // re-mount to re-trigger stagger animation per page
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            sx={{ scrollMarginTop: '100px' }}
          >
            {visiblePosts.map((post) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={post.slug}
                component={m.div}
                variants={fadeInUp}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 'none',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardActionArea component={RouterLink} to={`/blog/${post.slug}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={`${post.title} — MultiPost blog`}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                        />
                      </Box>
                      <Typography gutterBottom variant="h5" component="h2" fontWeight={700}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {post.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {post.author}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(post.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ── Prev / Page Numbers / Next — fully crawlable <a> tags ── */}
          {!isFiltered && totalPages > 1 && (
            <Box
              component="nav"
              aria-label="Blog pagination"
              sx={{
                mt: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                flexWrap: 'wrap',
              }}
            >
              {/* ◀ Prev button */}
              <Button
                component="a"
                href={hasPrev ? pageHref(safePage - 1) : undefined}
                onClick={hasPrev ? navigateToPage(safePage - 1) : undefined}
                disabled={!hasPrev}
                rel={hasPrev ? 'prev' : undefined}
                aria-label="Previous page"
                variant="outlined"
                size="medium"
                startIcon={<NavigateBeforeIcon />}
                sx={{
                  minWidth: { xs: 40, sm: 110 },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  transition: 'all 0.25s ease',
                  '&:not(:disabled):hover': {
                    transform: 'translateX(-3px)',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Prev
                </Box>
              </Button>

              {/* Page number buttons */}
              {pageNumbers.map((page, idx) =>
                page === '...' ? (
                  <Typography
                    key={`ellipsis-${idx}`}
                    variant="body2"
                    sx={{ mx: 0.5, color: 'text.secondary', userSelect: 'none' }}
                  >
                    …
                  </Typography>
                ) : (
                  <Button
                    key={page}
                    component="a"
                    href={pageHref(page)}
                    onClick={navigateToPage(page)}
                    size="small"
                    variant={page === safePage ? 'contained' : 'text'}
                    color="primary"
                    aria-label={`Page ${page}`}
                    aria-current={page === safePage ? 'page' : undefined}
                    sx={{
                      minWidth: 40,
                      height: 40,
                      fontWeight: page === safePage ? 700 : 500,
                      borderRadius: 2,
                      transition: 'all 0.25s ease',
                      ...(page === safePage
                        ? {
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                            pointerEvents: 'none',
                          }
                        : {
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              transform: 'translateY(-2px)',
                            },
                          }),
                    }}
                  >
                    {page}
                  </Button>
                )
              )}

              {/* Next ▶ button */}
              <Button
                component="a"
                href={hasNext ? pageHref(safePage + 1) : undefined}
                onClick={hasNext ? navigateToPage(safePage + 1) : undefined}
                disabled={!hasNext}
                rel={hasNext ? 'next' : undefined}
                aria-label="Next page"
                variant="outlined"
                size="medium"
                endIcon={<NavigateNextIcon />}
                sx={{
                  minWidth: { xs: 40, sm: 110 },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  transition: 'all 0.25s ease',
                  '&:not(:disabled):hover': {
                    transform: 'translateX(3px)',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Next
                </Box>
              </Button>
            </Box>
          )}

          {/* Page info text for accessibility + crawlers */}
          {!isFiltered && totalPages > 1 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: 'center' }}
              aria-live="polite"
            >
              Page {safePage} of {totalPages}
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default BlogPage;