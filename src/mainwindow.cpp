#include "mainwindow.h"
#include "./ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent) : QMainWindow(parent), ui(new Ui::MainWindow) {

  m_playlist = new PlaylistModel(this);
  ui->setupUi(this);
  connect(ui->actionOpen, &QAction::triggered, this, &MainWindow::open);
  // setAcceptDrops(true);
  m_audio_output = new QAudioOutput(this);
  m_player = new QMediaPlayer(this);
  m_player->setAudioOutput(m_audio_output);

  m_playlist_view = new PlaylistView(this);
  m_playlist_view->setModel(m_playlist);
  ui->centralwidget->layout()->addWidget(m_playlist_view);

  connect(m_player, &QMediaPlayer::durationChanged, this, &MainWindow::durationChanged);
  connect(
      m_playlist_view, &PlaylistView::audioFileDropped, m_playlist, &PlaylistModel::addAudioFile);
  connect(m_playlist_view, &PlaylistView::csvFileDropped, m_playlist, &PlaylistModel::addCsvFile);
  connect(m_playlist_view, &QTableView::doubleClicked, [=](const QModelIndex &index) {
    qDebug() << "double clicked";
    m_player->setSource(m_playlist->getUrl(index));
  });
  connect(ui->discoverDeviceButton, &QPushButton::clicked, this,
      &MainWindow::on_discoverButton_clicked);
}

MainWindow::~MainWindow() { delete ui; }
void MainWindow::mousePressEvent(QMouseEvent *event) { qDebug() << event->pos().x(); }

void MainWindow::on_dropEvent(QDropEvent *event) {
  //    ui->label->setText(event->mimeData()->text());
  //    mimeTypeCombo->clear();
  //    mimeTypeCombo->addItems(event->mimeData()->formats());
  qDebug("dropped");
  event->acceptProposedAction();
}

void MainWindow::open() {
  QString fileName = QFileDialog::getOpenFileName(this, "Open the file");
  if (fileName.isEmpty())
    return;

  QFile file(fileName);
  currentFile = fileName;
  if (!file.open(QIODevice::ReadOnly)) {
    QMessageBox::warning(this, "Warning", "Cannot open file: " + file.errorString());
    return;
  }
  m_player->setSource(QUrl::fromLocalFile(fileName));
  //    m_player->play();
  //        file.readAll();

  setWindowTitle(fileName);
  //        QTextStream in(&file);
  //        QString text = in.readAll();
  //        ui->textEdit->setText(text);
  file.close();
}

void MainWindow::on_playButton_clicked() { m_player->play(); }
void MainWindow::on_discoverButton_clicked() {

  m_ble_worker = new SenderThread(this);
  m_deviceDiscoveryAgent = new QBluetoothDeviceDiscoveryAgent(this);
  m_deviceDiscoveryAgent->setLowEnergyDiscoveryTimeout(15000);

  connect(m_deviceDiscoveryAgent, &QBluetoothDeviceDiscoveryAgent::deviceDiscovered,
      [&] { qDebug() << "discovered: " << m_deviceDiscoveryAgent->discoveredDevices().size(); });
  connect(m_deviceDiscoveryAgent, &QBluetoothDeviceDiscoveryAgent::errorOccurred,
      [&] { qDebug() << "error"; });

  connect(m_deviceDiscoveryAgent, &QBluetoothDeviceDiscoveryAgent::finished,
      [&] { qDebug() << m_deviceDiscoveryAgent->discoveredDevices().size(); });
  connect(m_deviceDiscoveryAgent, &QBluetoothDeviceDiscoveryAgent::canceled, m_ble_worker,
      &SenderThread::scanFinished);
  m_ble_worker->start();
  m_deviceDiscoveryAgent->start(QBluetoothDeviceDiscoveryAgent::LowEnergyMethod);
  // m_deviceDiscoveryAgent->is
}

void MainWindow::on_pauseButton_clicked() { m_player->pause(); }

void MainWindow::durationChanged(qint64 duration) {
  m_duration = duration / 1000;
  ui->seekBar->setMaximum(duration);
}

void MainWindow::on_seekBar_sliderMoved(int position) {}
