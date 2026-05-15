import * as React from 'react';
import MetadataTable from '../components/MetadataTable';
import {
  ReadHatsSection,
  DownloadSection,
  getReadCommand,
  getDownloadCommand,
} from '../components/LoadDataSection';
import { InfoBanner, WarningBanner } from './Banner';
import ReferencesSection from '../components/ReferencesSection';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const getProtocol = (url) =>
  url && url.includes('://') ? url.split('://')[0].toLowerCase() : null;

// ---------------------------------------------------------------------------
// Icon helper for badge labels
// ---------------------------------------------------------------------------

const isWarningBadge = (title) => {
  const t = title.toLowerCase();
  return t.includes('only on') || t.includes('usdf') || t.includes('restricted');
};

const getBadgeIcon = (title) => {
  const t = title.toLowerCase();
  if (t.match(/west|east|north|south|us-|eu-|ap-|europe/))
    return <PlaceOutlinedIcon sx={{ fontSize: 13 }} />;
  if (t.match(/https?/)) return <LanguageOutlinedIcon sx={{ fontSize: 13 }} />;
  if (t.includes('s3') || t.includes('aws')) return <CloudOutlinedIcon sx={{ fontSize: 13 }} />;
  if (isWarningBadge(t)) return <LockOutlinedIcon sx={{ fontSize: 13 }} />;
  return <InfoOutlinedIcon sx={{ fontSize: 13 }} />;
};

// ---------------------------------------------------------------------------
// Tab-switching load/download section (needs useState, must be a component)
// ---------------------------------------------------------------------------

const LoadingSection = ({ main_url, margin_catalog, protocol, displayDownload }) => {
  const readCommand = getReadCommand(main_url, margin_catalog);
  const downloadCommand = getDownloadCommand(protocol, main_url);

  const loader = readCommand?.includes('.parquet') ? 'Pandas' : 'LSDB';
  const downloadLabel = protocol === 's3' ? 'Download with S3' : 'Download with wget';

  const hasRead = !!readCommand;
  const hasDownload = !!(downloadCommand && displayDownload);

  const [activeTab, setActiveTab] = React.useState(hasRead ? 'load' : 'download');

  if (!hasRead && !hasDownload) return null;

  if (!hasRead || !hasDownload) {
    const singleLabel = hasRead ? `Load using ${loader}` : downloadLabel;
    return (
      <div id='load-data-section'>
        <div className='code-tabs'>
          <button className='code-tab active' style={{ cursor: 'default' }} tabIndex={-1}>
            {singleLabel}
          </button>
        </div>
        <div className='code-tab-content'>
          {hasRead && <ReadHatsSection protocol={protocol} command={readCommand} hideTitle />}
          {hasDownload && (
            <DownloadSection protocol={protocol} command={downloadCommand} hideTitle />
          )}
        </div>
      </div>
    );
  }

  return (
    <div id='load-data-section'>
      <div className='code-tabs'>
        <button
          className={`code-tab${activeTab === 'load' ? ' active' : ''}`}
          onClick={() => setActiveTab('load')}
        >
          Load using {loader}
        </button>
        <button
          className={`code-tab${activeTab === 'download' ? ' active' : ''}`}
          onClick={() => setActiveTab('download')}
        >
          {downloadLabel}
        </button>
      </div>
      <div className='code-tab-content'>
        {activeTab === 'load' && (
          <ReadHatsSection protocol={protocol} command={readCommand} hideTitle />
        )}
        {activeTab === 'download' && (
          <DownloadSection protocol={protocol} command={downloadCommand} hideTitle />
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function CatalogTab({ catalog_info, skymapPath }) {
  const navigate = useNavigate();
  const {
    name,
    description,
    metadata,
    badges,
    urls = {},
    other_urls,
    notes,
    column_mean_maps,
  } = catalog_info;

  const { catalog, margin_catalog, collection, point_density_map, displayDownload = true } = urls;
  const main_url = catalog || collection;
  const protocol = getProtocol(main_url);

  return (
    <div className='catalog-detail'>
      <div id='catalog-title'>
        {createTitle(protocol, catalog || collection, name)}
        {createBadges(badges, column_mean_maps, skymapPath, navigate)}
      </div>

      <div className='desc-density-row'>
        {description && <p className='catalog-description'>{description}</p>}
        {point_density_map && (
          <div className='density-hero'>
            <img src={point_density_map} alt={`${name} sky coverage`} />
            <div className='density-hero-caption'>Sky coverage map</div>
          </div>
        )}
      </div>

      {notes && createNotes(notes)}
      {main_url && (
        <LoadingSection
          main_url={main_url}
          margin_catalog={margin_catalog}
          protocol={protocol}
          displayDownload={displayDownload}
        />
      )}
      {metadata && <MetadataTable metadata={metadata} />}
      {other_urls && <ReferencesSection urls={other_urls} />}
    </div>
  );
}

const createTitle = (protocol, catalog_url, catalog_name) => {
  const isHTTP = protocol === 'http' || protocol === 'https';
  return (
    <h2 className='catalog-title'>
      {isHTTP ? <a href={catalog_url}>{catalog_name}</a> : <span>{catalog_name}</span>}
    </h2>
  );
};

const createBadges = (badges, column_mean_maps, skymapPath, navigate) => {
  const hasBadges = badges && badges.length > 0;
  const hasSkymap = !!(column_mean_maps && skymapPath);

  if (!hasBadges && !hasSkymap) return null;

  return (
    <Stack id='badges' direction='row' alignItems='center' spacing={2} flexWrap='wrap'>
      {hasBadges &&
        badges.map((badge, i) => (
          <span
            key={`badge-${i}`}
            className={`catalog-badge${isWarningBadge(badge.title) ? ' catalog-badge--warning' : ''}`}
          >
            {getBadgeIcon(badge.title)}
            {badge.title}
          </span>
        ))}
      {hasSkymap && (
        <Button
          variant='outlined'
          color='secondary'
          size='small'
          onClick={() => navigate(skymapPath)}
          sx={{ fontFamily: '"Outfit", sans-serif', textTransform: 'capitalize' }}
        >
          View Skymaps
        </Button>
      )}
    </Stack>
  );
};

const createNotes = (notes) => {
  return (
    <div className='notes'>
      {notes.map((note, i) => {
        const Banner = note.type?.toLowerCase() === 'warning' ? WarningBanner : InfoBanner;
        return (
          <Banner title={note.title} key={`note-${i}`}>
            {note.content}
          </Banner>
        );
      })}
    </div>
  );
};
