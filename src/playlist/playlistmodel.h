#ifndef PLAYLISTMODEL_H
#define PLAYLISTMODEL_H

#include <QAbstractTableModel>
#include <QMediaMetaData>
#include <QMediaPlayer>
#include <QObject>
#include <QUrl>
#include <Qt>

struct PlayListItem {
  QVariant title = "";
  QVariant album = "";
  QVariant artist = "";
  QVariant trackNumber = "";
  QVariant duration = 0;
  QVariant mediaType = "";
  QUrl url;
  QUrl csvUrl;
  PlayListItem(QUrl url, QVariant title, QVariant album, QVariant artist, QVariant trackNumber,
      QVariant duration, QVariant mediaType)
      : title{title},
        url{url},
        album(album),
        artist(artist),
        trackNumber(trackNumber),
        duration(duration),
        mediaType(mediaType){};
};

class PlaylistModel : public QAbstractTableModel {
  Q_OBJECT
public:
  explicit PlaylistModel(QObject *parent = nullptr);
  int rowCount(const QModelIndex &parent = QModelIndex()) const override;
  int columnCount(const QModelIndex &parent = QModelIndex()) const override;

  QVariant data(const QModelIndex &index, int role = Qt::DisplayRole) const override;
  QVariant headerData(int section, Qt::Orientation orientation, int role) const override;
  QUrl getUrl(const QModelIndex &index) const;

public slots:
  void addAudioFile(QString file_name);
  void addCsvFile(QString file_name, QModelIndex const &index);

private:
  QList<PlayListItem> m_data;
};

#endif // PLAYLISTMODEL_H
