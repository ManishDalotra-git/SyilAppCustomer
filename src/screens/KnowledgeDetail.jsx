import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHTML from 'react-native-render-html';

import ImageViewing from 'react-native-image-viewing';
import Video from 'react-native-video';
import { HTMLElementModel, HTMLContentModel } from 'react-native-render-html';

const KnowledgeDetail = ({ route, navigation }) => {


  const customHTMLElementModels = {
    video: HTMLElementModel.fromCustomModel({
      tagName: 'video',
      contentModel: HTMLContentModel.block, // ⚠️ important
    }),
  };


  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');

  const { article } = route.params;
  const { width } = useWindowDimensions();

  const scrollRef = useRef(null);
  const headingPositions = useRef([]);

  const [html, setHtml] = useState('');
  const [toc, setToc] = useState([]);
  const [showToc, setShowToc] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // ====== ROWSPAN NORMALIZER FUNCTION ======
  const normalizeRowspanHTML = (html) => {
    return html.replace(
      /<table[\s\S]*?<\/table>/gi,
      (tableHtml) => {
        const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi);
        if (!rows) return tableHtml;

        const activeRowspans = [];
        const newRows = [];

        rows.forEach((row) => {
          let cells = row.match(/<(td|th)[\s\S]*?<\/\1>/gi) || [];
          let finalCells = [];

          // Inject active rowspan cells first (empty cells)
          activeRowspans.forEach((r) => {
            finalCells.push('<td></td>'); // empty cell
            r.count--;
          });

          // Remove expired rowspans
          for (let i = activeRowspans.length - 1; i >= 0; i--) {
            if (activeRowspans[i].count <= 0) activeRowspans.splice(i, 1);
          }

          cells.forEach((cellHtml) => {
            const rowspanMatch = cellHtml.match(/rowspan=["'](\d+)["']/i);
            if (rowspanMatch) {
              const span = parseInt(rowspanMatch[1], 10);
              const cleanCell = cellHtml.replace(/rowspan=["']\d+["']/i, '');
              finalCells.push(cleanCell);

              if (span > 1) {
                activeRowspans.push({ html: cleanCell, count: span - 1 });
              }
            } else {
              finalCells.push(cellHtml);
            }
          });

          newRows.push(`<tr>${finalCells.join('')}</tr>`);
        });

        return tableHtml.replace(/<tr[\s\S]*?<\/tr>/gi, () => newRows.shift());
      }
    );
  };
  // ====== END ROWSPAN NORMALIZER ======

  useEffect(() => {
    let rawHtml = article?.['Article body'] || '';

    // Apply rowspan normalization here
    rawHtml = normalizeRowspanHTML(rawHtml);

    rawHtml = rawHtml
      .replace(/<tr>\s*(<td>(&nbsp;|\s)*<\/td>\s*)+<\/tr>/gi, '')
      .replace(/<p>(&nbsp;|\s)*<\/p>/gi, '');

    // Table wrapper for horizontal scroll
    rawHtml = rawHtml.replace(/<table/gi, '<div class="rn-table"><table');
    rawHtml = rawHtml.replace(/<\/table>/gi, '</table></div>');

    const headings = [];
    let index = 0;

    rawHtml = rawHtml.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => {
      headings.push({
        index,
        title: content.replace(/<[^>]+>/g, '').trim(),
      });
      index++;
      return `<h3>${content}</h3>`;
    });

    setHtml(rawHtml);
    setToc(headings);

    setHtml(rawHtml);
  }, [article]);

  const H3Renderer = ({ TDefaultRenderer, ...props }) => {
    const currentIndex = headingPositions.current.length;
    return (
      <View
        onLayout={(e) => {
          headingPositions.current[currentIndex] = e.nativeEvent.layout.y;
        }}
      >
        <TDefaultRenderer {...props} />
      </View>
    );
  };

  const ImageRenderer = ({ tnode }) => {
    const uri = tnode.attributes.src;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setImageUrl(uri);
          setImageVisible(true);
        }}
      >
        <Image
          source={{ uri }} 
          style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 }}
        />
      </TouchableOpacity>
    );
  };

  const VideoRenderer = ({ tnode }) => {
  const uri = tnode.attributes.src;

  if (!uri) return null;

  return (
    <View style={{ marginVertical: 12 }}>
      <Video
        source={{ uri }}
        style={{ width: '100%', height: 220 }}
        controls
        resizeMode="contain"
        paused={true}
        volume={1.0}
        muted={false}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
      />
    </View>
  );
};

    const renderers = useMemo(
    () => ({
      h3: H3Renderer,
      img: ImageRenderer,
      video: VideoRenderer, 
    }),
    []
  );

  const renderersProps = useMemo(
    () => ({
      a: { onPress: (_, href) => href && Linking.openURL(href) },
      div: {
        wrapperComponent: ({ tnode, children }) => {
          if (tnode.attributes.class === 'rn-table') {
            // ✅ Horizontal ScrollView for tables
            return (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>{children}</View>
              </ScrollView>
            );
          }
          return <>{children}</>;
        },
      },
    }),
    []
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../../images/circle_arrow.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        

         {/* META */}
        <View style={styles.metaContainer}>
          <Text style={styles.title}>{article?.['Article title']}</Text>

          {!!article?.Category && (
            <Text style={styles.metaText}>
              Category:{' '}
              <Text style={styles.metaValue}>{article.Category}</Text>
            </Text>
          )}

          {!!article?.Subcategory && (
            <Text style={styles.metaText}>
              Subcategory:{' '}
              <Text style={styles.metaValue}>{article.Subcategory}</Text>
            </Text>
          )}

          {!!article?.['Last modified date'] && (
            <Text style={styles.metaText}>
              Last Updated:{' '}
              <Text style={styles.metaValue}>
                {formatDate(article['Last modified date'])}
              </Text>
            </Text>
          )}
        </View>

        {/* TOC */}
        {toc.length > 0 && (
          <View style={styles.tocWrapper}>
            <Text style={styles.tocTitle}>Table of Contents</Text>

            <TouchableOpacity
              style={styles.tocDropdown}
              onPress={() => setShowToc(!showToc)}
            >
              <Text style={styles.tocPlaceholder}>Select section</Text>
              <Text>⌄</Text>
            </TouchableOpacity>

            {showToc &&
              toc.map((item) => (
                <TouchableOpacity
                  key={item.index}
                  style={styles.tocItem}
                  onPress={() => scrollToSection(item.index)}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}


        <View style={styles.categoryList}>

        <RenderHTML
          contentWidth={width}
          source={{ html }}
          renderers={renderers}
          customHTMLElementModels={customHTMLElementModels}
          tagsStyles={htmlStyles}
          renderersProps={{
            div: {
              wrapperComponent: ({ tnode, children }) => {
                if (tnode.attributes.class === 'rn-table') {
                  
                  return (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      style={{ marginVertical: 10 }}
                    >
                      <View style={{ flexDirection: 'row', minWidth: 700 }}>
                        {children}
                      </View>
                    </FlatList>
                  );
                }
                return <>{children}</>;
              },
            },
          }}
        />
        </View>
      </ScrollView>

      <ImageViewing
        images={imageUrl ? [{ uri: imageUrl }] : []}
        imageIndex={0}
        visible={imageVisible}
        onRequestClose={() => setImageVisible(false)}
      />
    </SafeAreaView>
  );
};

export default KnowledgeDetail;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  arrowIcon: { width: 32, height: 32 },
  header: { width: '94%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60, backgroundColor: '#fff' },
  backButton: { marginRight: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  metaContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#555',
  },
  metaValue: {
    fontWeight: '600',
    color: '#000',
  },
  tocWrapper: {
    backgroundColor: '#ffe600',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    display:'none',
  },
  tocTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  tocDropdown: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tocPlaceholder: {
    color: '#555',
  },
  tocItem: {
    paddingVertical: 8,
  },
});

const htmlStyles = {
  table: { borderWidth: 1, borderColor: '#000', borderCollapse: 'collapse', minWidth: '100%' },
  tr: { flexDirection: 'row', display:'flex', },
  th: { borderWidth: 1, borderColor: '#000', padding: 5, backgroundColor: '#f5f7ff', fontWeight: '700', fontSize: 5, flex:1, },
  td: { borderWidth: 1, borderColor: '#000', padding: 5, flex:1, fontSize: 5, },
  p: { marginVertical: 8, fontSize: 14 },
  h3: { fontSize: 18, fontWeight: '700', marginVertical: 12 },
  a: { color: '#1a73e8', textDecorationLine: 'underline' },
};
